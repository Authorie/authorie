import { useRouter } from "next/router";
import ChapterFeed from "~/components/Chapter/ChapterFeed";
import ChapterFeedSkeleton from "~/components/Chapter/ChapterFeedSkeleton";
import useInfiniteScroll from "~/hooks/infiniteScroll";
import { api } from "~/utils/api";

const HomePage = () => {
  const router = useRouter();
  const penname = router.query.penname as string;
  const { data, fetchNextPage, isFetchingNextPage, isLoading, hasNextPage } =
    api.chapter.getAllChapters.useInfiniteQuery(
      {
        penname,
        limit: 10,
      },
      {
        getNextPageParam: (lastpage) => lastpage.nextCursor,
        enabled: router.isReady,
      }
    );

  useInfiniteScroll(fetchNextPage, hasNextPage);

  return (
    <div className="flex w-[1024px] flex-col gap-4 py-8">
      {data &&
        data.pages
          .flatMap((page) => page.items)
          .map((chapter) => <ChapterFeed key={chapter.id} chapter={chapter} />)}
      {(isFetchingNextPage || isLoading) && (
        <div>
          <ChapterFeedSkeleton />
        </div>
      )}
      {data &&
        data.pages.flatMap((page) => page.items).length === 0 &&
        !isLoading && (
          <div className="flex h-44 items-center justify-center rounded-lg bg-white text-3xl font-semibold">
            The author has not published anything yet!
          </div>
        )}
    </div>
  );
};

export default HomePage;
