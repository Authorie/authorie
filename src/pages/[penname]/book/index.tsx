import Book from "@components/Book/Book";
import { BookStatus } from "@prisma/client";
import { appRouter } from "@server/api/root";
import { createInnerTRPCContext } from "@server/api/trpc";
import { getServerAuthSession } from "@server/auth";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { api } from "@utils/api";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { HiOutlineArchiveBox, HiOutlineArrowUturnLeft } from "react-icons/hi2";
import superjson from "superjson";

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getServerAuthSession(context);
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: createInnerTRPCContext({ session }),
    transformer: superjson,
  });
  const penname = context.query.penname as string;
  const promises = [ssg.book.getAll.prefetch({ penname })];
  if (session) promises.push(ssg.user.getData.prefetch(undefined));
  await Promise.allSettled(promises);

  return {
    props: {
      trpcState: ssg.dehydrate(),
      session,
      penname,
    },
  };
};

type props = InferGetServerSidePropsType<typeof getServerSideProps>;

const BookPage = ({ penname }: props) => {
  const { status } = useSession();
  const [openArchive, setOpenArchive] = useState(false);
  const { data: user } = api.user.getData.useQuery(undefined, {
    enabled: status === "authenticated",
  });
  const { data: books } = api.book.getAll.useQuery({ penname });
  const { data: archiveBooks } = api.book.getAll.useQuery({
    penname: penname,
    status: [BookStatus.ARCHIVED],
  });
  return (
    <div className="mb-8 mt-6 w-[1024px]">
      <div className={"max-h-full rounded-lg p-4 px-6 shadow-lg"}>
        <div className="flex items-center justify-start">
          {!openArchive ? (
            <div
              onClick={() => setOpenArchive(true)}
              className="mb-3 flex cursor-pointer items-center justify-center gap-2 rounded-full bg-gray-400 px-4 py-1 text-sm font-semibold text-white hover:bg-gray-500"
            >
              <HiOutlineArchiveBox className="h-5 w-5" />
              <p>View Archived</p>
            </div>
          ) : (
            <div
              onClick={() => setOpenArchive(false)}
              className="mb-3 flex cursor-pointer items-center justify-center gap-2 rounded-full bg-authGreen-400 px-4 py-1 text-sm font-semibold text-white hover:bg-authGreen-500"
            >
              <HiOutlineArrowUturnLeft className="h-5 w-5" />
              <p>View Book Shelf</p>
            </div>
          )}
        </div>
        {books &&
          books.length === 0 &&
          (user && user.penname === penname ? (
            <div className="flex flex-col items-center gap-4">
              <p>You still don&apos;t have any book yet. Wanna create one?</p>
              <Link
                href="/create/book"
                className="rounded-lg bg-green-600 px-3 py-2 text-white hover:bg-green-700"
              >
                Create book now!
              </Link>
            </div>
          ) : (
            <div>
              <p>{`${penname} still has not published any book yet!`}</p>
            </div>
          ))}
        {books && (
          <>
            {!openArchive ? (
              <div className="grid grid-cols-4 gap-x-8 gap-y-6">
                {books.map(
                  (book) =>
                    book.status !== BookStatus.ARCHIVED && (
                      <Book
                        key={book.id}
                        id={book.id}
                        title={book.title}
                        coverImage={book.coverImage}
                        description={book.description}
                        isOwner={book.isOwner}
                        status={book.status}
                        like={book.chapters.reduce(
                          (acc, curr) => acc + curr._count.likes,
                          0
                        )}
                        read={book.chapters.reduce(
                          (acc, curr) => acc + curr.views,
                          0
                        )}
                      />
                    )
                )}
              </div>
            ) : (
              archiveBooks &&
              (archiveBooks.length === 0 ? (
                <div className="flex items-center justify-center text-xl font-bold">
                  <p>No book being archived</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-x-8 gap-y-6">
                  {archiveBooks.map((book) => (
                    <Book
                      key={book.id}
                      id={book.id}
                      title={book.title}
                      coverImage={book.coverImage}
                      description={book.description}
                      isOwner={book.isOwner}
                      status={book.status}
                      like={book.chapters.reduce(
                        (acc, curr) => acc + curr._count.likes,
                        0
                      )}
                      read={book.chapters.reduce(
                        (acc, curr) => acc + curr.views,
                        0
                      )}
                    />
                  ))}
                </div>
              ))
            )}
          </>
        )}
      </div>
      {openArchive && (
        <p className="mt-4 text-sm text-gray-600">
          Noted: Unarchive to make the book viewable again
        </p>
      )}
    </div>
  );
};

export default BookPage;
