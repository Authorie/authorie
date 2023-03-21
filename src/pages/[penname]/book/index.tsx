import Book from "@components/Book/Book";
// import {
//   Bars3CenterLeftIcon,
//   MagnifyingGlassIcon,
// } from "@heroicons/react/24/outline";
import { api } from "@utils/api";
import Link from "next/link";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { getServerAuthSession } from "@server/auth";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { createInnerTRPCContext } from "@server/api/trpc";
import { appRouter } from "@server/api/root";
import superjson from "superjson";
import { useSession } from "next-auth/react";

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
  const { data: user } = api.user.getData.useQuery(undefined, {
    enabled: status === "authenticated",
  });
  const { data: books } = api.book.getAll.useQuery({ penname });

  return (
    <div className="mb-8 mt-6 min-w-[1024px]">
      <div className="max-h-full rounded-lg bg-white p-4 px-6 shadow-lg">
        {/* <div className="mb-5 flex justify-between">
          <Bars3CenterLeftIcon className="h-7 w-7 rounded-lg bg-dark-100 text-authGreen-600" />
          <MagnifyingGlassIcon className="h-7 w-7 rounded-lg bg-dark-100 text-authGreen-600" />
        </div> */}
        {books &&
          books.items.length === 0 &&
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
            {books.items.map((book) => (
              <Book
                key={book.id}
                id={book.id}
                title={book.title}
                coverImage={book.coverImage}
                description={book.description}
                isOwner={book.isOwner}
                like={book.chapters.reduce(
                  (acc, curr) => acc + curr._count.likes,
                  0
                )}
                read={book.chapters.reduce((acc, curr) => acc + curr.views, 0)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookPage;
