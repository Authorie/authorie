import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import CategoryBoard from "~/components/CategoryBoard/CategoryBoard";
import { useFollowedCategories } from "~/hooks/followedCategories";
import { useSelectedCategory } from "~/hooks/selectedCategory";
import { useSelectedDate } from "~/hooks/selectedDate";
import { api } from "~/utils/api";
const ChapterFeed = dynamic(() => import("~/components/Chapter/ChapterFeed"));

const Home = () => {
  const selectedDate = useSelectedDate();
  const { status } = useSession();
  const { data: categories } = api.category.getAll.useQuery();
  const selectedCategories = useSelectedCategory();
  const followedCategories = useFollowedCategories();
  const categoryIds =
    selectedCategories === "all"
      ? categories?.map((c) => c.id)
      : selectedCategories === "following"
      ? followedCategories.map((c) => c.id)
      : [selectedCategories.id];
  const { data } = api.chapter.getFeeds.useInfiniteQuery(
    {
      limit: 10,
      categoryIds: categoryIds,
      publishedAt: selectedDate,
    },
    {
      getNextPageParam: (lastpage) => lastpage.nextCursor,
    }
  );

  return (
    <div className="flex flex-col px-10 py-4">
      <CategoryBoard isLogin={status === "authenticated"} />
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
