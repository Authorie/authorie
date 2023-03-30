import Book from "@components/Book/Book";
// import {
//   Bars3CenterLeftIcon,
//   MagnifyingGlassIcon,
// } from "@heroicons/react/24/outline";
import {
  ArchiveBoxIcon,
  ArrowUturnLeftIcon,
} from "@heroicons/react/24/outline";
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
import { useState } from "react";
import Link from "next/link";
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
  const BookArchiveList = books?.items.filter(
    (book) => book.status === BookStatus.ARCHIVED
  ).length;
  return (
    <div className="mb-8 mt-6 w-[1024px]">
      <div className="max-h-full rounded-lg bg-white p-4 px-6 shadow-lg">
        {/* <div className="mb-5 flex justify-between">
          <Bars3CenterLeftIcon className="h-7 w-7 rounded-lg bg-dark-100 text-authGreen-600" />
          <MagnifyingGlassIcon className="h-7 w-7 rounded-lg bg-dark-100 text-authGreen-600" />
        </div> */}
        <div className="flex items-center justify-start">
          {!openArchive ? (
            <div
              onClick={() => setOpenArchive(true)}
              className="mb-3 flex cursor-pointer items-center justify-center gap-2 rounded-full bg-gray-400 px-4 py-1 text-sm font-semibold text-white hover:bg-gray-500"
            >
              <ArchiveBoxIcon className="h-5 w-5" />
              <p>Your Archived</p>
            </div>
          ) : (
            <div
              onClick={() => setOpenArchive(false)}
              className="mb-3 flex cursor-pointer items-center justify-center gap-2 rounded-full bg-authGreen-400 px-4 py-1 text-sm font-semibold text-white hover:bg-authGreen-500"
            >
              <ArrowUturnLeftIcon className="h-5 w-5" />
              <p>Your Book Shelf</p>
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
          <div className="grid grid-cols-4 gap-x-8 gap-y-6">
            {!openArchive ? (
              books.items.map(
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
              )
            ) : BookArchiveList === 0 ? (
              <div className="flex items-center justify-center text-xl font-bold">
                <p>No book being archived</p>
              </div>
            ) : (
              books.items.map((book) => (
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
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookPage;
