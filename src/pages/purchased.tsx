import { api } from "~/utils/api";
import useInfiniteScroll from "~/hooks/infiniteScroll";
import ChapterPurchased from "~/components/Chapter/ChapterPurchased";
import ChapterPurchasedSkeleton from "~/components/Chapter/ChapterPurchasedSkeleton";
import { useSession } from "next-auth/react";

const PurchasedPage = () => {
  const { data: session } = useSession();
  const { data, fetchNextPage, hasNextPage } =
    api.chapter.getPurchased.useInfiniteQuery(
      {
        limit: 10,
      },
      {
        getNextPageParam: (lastpage) => lastpage.nextCursor,
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
    <div className="h-full w-full p-4">
      <div className="flex h-full w-full flex-col items-start gap-4 rounded-lg p-4">
        <div className="rounded-lg bg-white px-4 py-3 text-3xl font-semibold shadow-lg">
          My Purchased Chapter
        </div>
        <div className="grid w-full grid-cols-5 gap-4">
          {chapters.map(({ data: chapter }, index) =>
            chapter ? (
              chapter.chapterMarketHistories.some(
                (history) => history.userId === session?.user.id
              ) && <ChapterPurchased key={chapter.id} chapter={chapter} />
            ) : (
              <ChapterPurchasedSkeleton key={index} />
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchasedPage;
