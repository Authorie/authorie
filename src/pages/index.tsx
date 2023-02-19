import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { getServerAuthSession } from "@server/auth";
import NavigationSidebar from "@components/Navigation/NavigationSidebar";
import { useState } from "react";
import CategoryBar from "@components/Category/CategoryBar/CategoryBar";
import { api } from "@utils/api";
import CategorySelectionBoard from "@components/Category/CategorySelectionBoard/CategorySelectionBoard";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { createInnerTRPCContext } from "@server/api/trpc";
import { type AppRouter, appRouter } from "@server/api/root";
import superjson from "superjson";
import ChapterPost from "@components/Chapter/ChapterPost";
import { mockChapters } from "mocks";

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
  const { data: categories } = api.category.getAll.useQuery();
  const { data: userCategories } = api.category.getFollowed.useQuery();
  const [showCategories, setShowCategories] = useState<boolean>(false);

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
          <div className="flex flex-col gap-3 overflow-hidden rounded-xl bg-neutral-500">
            <div className="flex h-80 flex-col items-center justify-center rounded-xl bg-dark-600">
              {showCategories ? (
                <CategorySelectionBoard categoriesList={categories} />
              ) : (
                <h1 className="text-8xl text-white">For Ads</h1>
              )}
            </div>
            <CategoryBar
              categories={userCategories}
              openCategories={showCategories}
              onOpenCategories={() => setShowCategories((prev) => !prev)}
            />
          </div>
          <div className="flex flex-col gap-8">
            {mockChapters.map((chapter) => (
              <ChapterPost
                key={`${chapter.bookTitle}_${chapter.chapterNumber}_${chapter.chapterTitle}`}
                {...chapter}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
