import type { GetServerSidePropsContext } from "next";
import { getServerAuthSession } from "@server/auth";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { createInnerTRPCContext } from "@server/api/trpc";
import { appRouter } from "@server/api/root";
import superjson from "superjson";
import CategoryBoard from "@components/CategoryBoard/CategoryBoard";
import { useSession } from "next-auth/react";
import { api } from "@utils/api";
import { Fragment } from "react";
import ChapterFeed from "@components/Chapter/ChapterFeed";

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getServerAuthSession(context);
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: createInnerTRPCContext({ session }),
    transformer: superjson,
  });

  const promises = [
    ssg.category.getAll.prefetch(),
    ssg.chapter.getAll.prefetchInfinite({
      limit: 10,
    }),
  ];
  if (session) {
    promises.push(ssg.category.getFollowed.prefetch());
  }

  await Promise.allSettled(promises);
  return {
    props: {
      trpcState: ssg.dehydrate(),
      session,
    },
  };
};
// TODO: Guard categories with auth
const Home = () => {
  const { data: session } = useSession();
  const { data, isSuccess } = api.chapter.getAll.useInfiniteQuery(
    {
      limit: 10,
    },
    {
      getNextPageParam: (lastpage) => lastpage.nextCursor,
    }
  );

  return (
    <div className="flex flex-col px-10 py-4">
      <CategoryBoard isLogin={Boolean(session)} />
      <div className="flex flex-col gap-8">
        {isSuccess &&
          data?.pages.map((page, index) => (
            <Fragment key={index}>
              {page.items.map((chapter) => (
                <ChapterFeed key={chapter.id} chapter={chapter} />
              ))}
            </Fragment>
          ))}
      </div>
    </div>
  );
};

export default Home;
