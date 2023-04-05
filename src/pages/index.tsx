import CategoryBoard from "@components/CategoryBoard/CategoryBoard";
import ChapterFeed from "@components/Chapter/ChapterFeed";
import { useFollowedCategories } from "@hooks/followedCategories";
import { useSelectedCategory } from "@hooks/selectedCategory";
import { appRouter } from "@server/api/root";
import { createInnerTRPCContext } from "@server/api/trpc";
import { getServerAuthSession } from "@server/auth";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { api } from "@utils/api";
import type { GetServerSidePropsContext } from "next";
import { useSession } from "next-auth/react";
import superjson from "superjson";
import { useState } from "react";

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
    ssg.chapter.getFeeds.prefetchInfinite({
      limit: 10,
    }),
  ];

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
  const [dateSelected, setDateSelected] = useState<Date>(new Date());
  const { data: session } = useSession();
  const { data: categories } = api.category.getAll.useQuery();
  const selectedCategories = useSelectedCategory();
  const followedCategories = useFollowedCategories();
  const categoryIds =
    selectedCategories === "all"
      ? categories?.map((c) => c.id)
      : selectedCategories === "following"
      ? followedCategories.map((c) => c.id)
      : [selectedCategories.id];
  const { data, refetch } = api.chapter.getFeeds.useInfiniteQuery(
    {
      limit: 10,
      categoryIds: categoryIds,
      publishedAt: dateSelected || undefined,
    },
    {
      getNextPageParam: (lastpage) => lastpage.nextCursor,
    }
  );
  const refetchFeed = async (date: Date) => {
    setDateSelected(date);
    await refetch();
  };

  return (
    <div className="flex flex-col px-10 py-4">
      <CategoryBoard
        isLogin={Boolean(session)}
        refetchFeed={(date: Date) => void refetchFeed(date)}
      />
      <div className="flex flex-col gap-8">
        {data &&
          data.pages
            .flatMap((page) => page.items)
            .map((chapter) => (
              <ChapterFeed key={chapter.id} chapter={chapter} />
            ))}
      </div>
    </div>
  );
};

export default Home;
