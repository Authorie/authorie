import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import CategoryBoard from "~/components/CategoryBoard/CategoryBoard";
import { useFollowedCategories } from "~/hooks/followedCategories";
import { useSelectedCategory } from "~/hooks/selectedCategory";
import { useSelectedDate } from "~/hooks/selectedDate";
import { api } from "~/utils/api";
import { useEffect } from "react";
import toast from "react-hot-toast";
import ChapterFeedSkeleton from "~/components/Chapter/ChapterFeedSkeleton";
const ChapterFeed = dynamic(() => import("~/components/Chapter/ChapterFeed"));

interface MyScrollingElement extends HTMLElement {
  scrollHeight: number;
  scrollTop: number;
  clientHeight: number;
}

const Home = () => {
  const selectedDate = useSelectedDate();
  const { status } = useSession();
  const selectedCategories = useSelectedCategory();
  const followedCategories = useFollowedCategories();
  const categoryIds =
    selectedCategories === "all"
      ? undefined
      : selectedCategories === "following"
      ? followedCategories.map((c) => c.id)
      : [selectedCategories.id];
  const { data, fetchNextPage, isFetchingNextPage, hasNextPage } =
    api.chapter.getFeeds.useInfiniteQuery(
      {
        limit: 10,
        categoryIds: categoryIds,
        publishedAt: selectedDate,
      },
      {
        getNextPageParam: (lastpage) => lastpage.nextCursor,
      }
    );

  useEffect(() => {
    let fetching = false;
    const handleScroll = (e: Event) => {
      const target = e.target as EventTarget & {
        scrollingElement: MyScrollingElement;
      };
      const { scrollHeight, scrollTop, clientHeight } = target.scrollingElement;
      if (!fetching && scrollHeight - scrollTop <= clientHeight * 1.2) {
        fetching = true;
        if (hasNextPage)
          fetchNextPage()
            .then(() => {
              fetching = false;
            })
            .catch(() => {
              toast.error("Something went wrong");
            });
      }
    };
    document.addEventListener("scroll", handleScroll);
    return () => {
      document.removeEventListener("scroll", handleScroll);
    };
  }, [fetchNextPage, hasNextPage]);

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
      {isFetchingNextPage && (
        <div className="mt-8">
          <ChapterFeedSkeleton />
        </div>
      )}
    </div>
  );
};

export default Home;
