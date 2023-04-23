import { BookStatus } from "@prisma/client";
import dayjs from "dayjs";
import { useMemo } from "react";
import { api, type RouterOutputs } from "~/utils/api";
import ChapterRankCard from "./ChapterRankCard";
import ChapterRankMinicard from "./ChapterRankMinicard";

const Leaderboard = () => {
  const { data: leaderboard } = api.chapter.getLeaderboard.useQuery({
    limit: 6,
  });
  const chapters = api.useQueries((t) =>
    leaderboard
      ? leaderboard?.map((id) => t.chapter.getData({ id: id.chapterId }))
      : []
  );
  const topChapters = useMemo(() => {
    if (chapters.some((chapter) => chapter.data === undefined)) {
      return undefined;
    }
    return chapters
      .filter(
        ({ data: chapter }) =>
          chapter?.book?.status !== (BookStatus.DRAFT || BookStatus.ARCHIVED) &&
          chapter?.publishedAt !== null &&
          (chapter?.publishedAt as Date) < new Date()
      )
      .map(
        (chapter) => chapter.data
      ) as unknown as RouterOutputs["chapter"]["getData"][];
  }, [chapters]);

  return (
    <div className="flex h-full w-full justify-between px-10 py-4">
      <div className="flex flex-col gap-3">
        <div className="w-24 font-bold text-white">
          <span className="text-5xl">Best</span>{" "}
          <span className="text-3xl">Article of the</span>{" "}
          <span className="text-5xl">Month</span>
        </div>
        <span className="text-2xl font-semibold text-authGreen-400">
          {dayjs().format("MMMM")}
        </span>
      </div>
      <div className="flex gap-10">
        <div className="flex gap-4">
          {topChapters && (
            <>
              {topChapters[1] && topChapters[1].book && (
                <ChapterRankCard
                  rank={2}
                  chapterTitle={topChapters[1].title}
                  authorPenname={topChapters[1].owner.penname!}
                  image={topChapters[1].book.coverImage}
                  chapterId={topChapters[1].id}
                  read={topChapters[1]._count.views}
                />
              )}
              {topChapters[0] && topChapters[0].book && (
                <ChapterRankCard
                  rank={1}
                  chapterTitle={topChapters[0].title}
                  authorPenname={topChapters[0].owner.penname!}
                  image={topChapters[0].book?.coverImage}
                  chapterId={topChapters[0].id}
                  read={topChapters[0]._count.views}
                />
              )}
              {topChapters[2] && topChapters[2].book && (
                <ChapterRankCard
                  rank={3}
                  chapterTitle={topChapters[2].title}
                  authorPenname={topChapters[2].owner.penname!}
                  image={topChapters[2].book?.coverImage}
                  chapterId={topChapters[2].id}
                  read={topChapters[2]._count.views}
                />
              )}
            </>
          )}
        </div>
        <div className="flex flex-col gap-5 self-center">
          {topChapters &&
            topChapters.length > 3 &&
            topChapters
              .slice(3)
              .map((chapter, index) => (
                <ChapterRankMinicard
                  key={chapter.id}
                  rank={index + 4}
                  id={chapter.id}
                  title={chapter.title}
                  penname={chapter.owner.penname!}
                  views={chapter._count.views}
                />
              ))}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
