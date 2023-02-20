import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { getServerAuthSession } from "@server/auth";
import NavigationSidebar from "@components/Navigation/NavigationSidebar";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { createInnerTRPCContext } from "@server/api/trpc";
import { type AppRouter, appRouter } from "@server/api/root";
import superjson from "superjson";
import { useSession } from "next-auth/react";
import CategoryBoard from "@components/CategoryBoard/CategoryBoard";
import ChapterPostList from "@components/Chapter/ChapterPostList";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerAuthSession(context);
  const ssg = createProxySSGHelpers<AppRouter>({
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
const Home: NextPage = () => {
  const { data: session } = useSession();

  return (
    <>
      <Head>
        <title>Authorie</title>
        <meta
          name="description"
          content="Social media and publishing platform!"
        />
      </Head>
      <div className="flex justify-center">
        <NavigationSidebar />
        <div className="flex w-4/5 max-w-6xl flex-col gap-6 px-10 py-4">
          <CategoryBoard isLogin={Boolean(session)} />
          <ChapterPostList />
        </div>
      </div>
    </>
  );
};

export default Home;
