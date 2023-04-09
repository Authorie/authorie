import { useRouter } from "next/router";
import ChapterFeed from "~/components/Chapter/ChapterFeed";
import { api } from "~/utils/api";

const HomePage = () => {
  const router = useRouter();
  const penname = router.query.penname as string;
  const { data } = api.chapter.getAllChapters.useInfiniteQuery(
    {
      penname,
      limit: 10,
    },
    {
      getNextPageParam: (lastpage) => lastpage.nextCursor,
      enabled: router.isReady,
    }
  );

  return (
    <div className="flex w-[1024px] flex-col gap-8 py-8">
      {data &&
        data.pages
          .flatMap((page) => page.items)
          .map((chapter) => <ChapterFeed key={chapter.id} chapter={chapter} />)}
    </div>
  );
};

export default HomePage;
