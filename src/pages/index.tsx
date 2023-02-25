import type { GetServerSidePropsContext } from "next";
import { getServerAuthSession } from "@server/auth";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { createInnerTRPCContext } from "@server/api/trpc";
import { appRouter } from "@server/api/root";
import superjson from "superjson";
import CategoryBoard from "@components/CategoryBoard/CategoryBoard";
import ChapterPostList from "@components/Chapter/ChapterPostList";
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

  const promises = [ssg.category.getAll.prefetch()];
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
  return (
    <div className="flex flex-col gap-6 px-10 py-4">
      <CategoryBoard isLogin={Boolean(session)} />
      <ChapterPostList />
    </div>
  );
};

export default Home;
