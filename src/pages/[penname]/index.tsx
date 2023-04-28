import { useRouter } from "next/router";
import ChapterFeed from "~/components/Chapter/ChapterFeed";
import ChapterFeedSkeleton from "~/components/Chapter/ChapterFeedSkeleton";
import useInfiniteScroll from "~/hooks/infiniteScroll";
import { api } from "~/utils/api";

const HomePage = () => {
  const router = useRouter();
  const penname = router.query.penname as string;
  const { data, fetchNextPage, isLoading, hasNextPage } =
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
  const chapters = api.useQueries(
    (t) =>
      data?.pages
        .flatMap((page) => page.items)
        .map((chapter) => t.chapter.getData(chapter)) ?? []
  );
  useInfiniteScroll(fetchNextPage, hasNextPage);

  return (
    <div className="grid w-full grid-flow-row gap-4 px-24 py-8">
      {chapters.map(({ data: chapter }, index) =>
        chapter ? (
          <ChapterFeed key={chapter.id} chapter={chapter} />
        ) : (
          <ChapterFeedSkeleton key={index} />
        )
      )}
      {!isLoading && chapters.length === 0 && (
        <div className="flex h-44 items-center justify-center rounded-lg bg-white text-3xl font-semibold">
          The author has not published anything yet!
        </div>
      )}
    </div>
  );
};

export default HomePage;
