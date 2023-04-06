import {
  useFollowedCategories,
  useSetFollowedCategories,
} from "@hooks/followedCategories";
import type { RouterOutputs } from "@utils/api";
import { api } from "@utils/api";
import dayjs from "dayjs";
import { useCallback, useMemo, useState } from "react";
import CategoryBar from "./CategoryBar/CategoryBar";
import CategorySelectionBoard from "./CategorySelectionBoard/CategorySelectionBoard";
import ChapterRankCard from "./ChapterRankCard";
import ChapterRankMinicard from "./ChapterRankMinicard";

type props = {
  isLogin: boolean;
};

const CategoryBoard = ({ isLogin }: props) => {
  const { data: leaderboard } = api.chapter.getLeaderboard.useQuery({
    limit: 6,
  });
  const chapters = api.useQueries((t) =>
    leaderboard
      ? leaderboard?.map((id) => t.chapter.getData({ id: id.chapterId }))
      : []
  );
  const followedCategories = useFollowedCategories();
  const setFollowedCategories = useSetFollowedCategories();
  const [showCategories, setShowCategories] = useState(false);
  const { data: categories } = api.category.getAll.useQuery(undefined, {
    onSuccess(data) {
      if (isLogin) {
        setFollowedCategories(data.filter((category) => category.isSubscribed));
      }
    },
  });
  const onOpenCategoriesHandler = useCallback(() => {
    setShowCategories((prev) => !prev);
  }, [setShowCategories]);
  const topChapters = useMemo(() => {
    if (chapters.some((chapter) => chapter.data === undefined)) {
      return undefined;
    }

    return chapters.map(
      (chapter) => chapter.data
    ) as unknown as RouterOutputs["chapter"]["getData"][];
  }, [chapters]);

  return (
    <>
      <div className="flex min-w-[1024px] max-w-5xl flex-col overflow-hidden rounded-t-xl bg-neutral-500 pb-2">
        <div className="flex h-80 flex-col items-center justify-center rounded-xl bg-dark-600">
          {showCategories ? (
            <CategorySelectionBoard
              isLogin={isLogin}
              categoriesList={categories}
              followedCategories={followedCategories}
            />
          ) : (
            <div className="flex h-full w-full justify-between px-10 py-5">
              <div className="flex flex-col gap-3">
                <div className="w-24 font-bold text-white">
                  <span className="text-4xl">Best</span>{" "}
                  <span className="text-2xl">Article of the</span>{" "}
                  <span className="text-4xl">Month</span>
                </div>
                <span className="text-xl font-semibold text-authGreen-400">
                  {dayjs().format("MMMM")}
                </span>
              </div>
              <div className="flex gap-10">
                <div className="flex gap-4">
                  {topChapters && (
                    <>
                      {topChapters[1] && (
                        <ChapterRankCard
                          rank={2}
                          chapterTitle={topChapters[1].title}
                          authorPenname={topChapters[1].owner.penname as string}
                          image={topChapters[1].book?.coverImage || ""}
                          chapterId={topChapters[1].id}
                          read={topChapters[1]._count.views || 0}
                        />
                      )}
                      {topChapters[0] && (
                        <ChapterRankCard
                          rank={1}
                          chapterTitle={topChapters[0].title}
                          authorPenname={topChapters[0].owner.penname as string}
                          image={topChapters[0].book?.coverImage || ""}
                          chapterId={topChapters[0].id}
                          read={topChapters[0]._count.views || 0}
                        />
                      )}
                      {topChapters[2] && (
                        <ChapterRankCard
                          rank={3}
                          chapterTitle={topChapters[2].title}
                          authorPenname={topChapters[2].owner.penname as string}
                          image={topChapters[2].book?.coverImage || ""}
                          chapterId={topChapters[2].id}
                          read={topChapters[2]._count.views || 0}
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
                          penname={chapter.owner.penname as string}
                          views={chapter._count.views}
                        />
                      ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <CategoryBar
        isLogin={isLogin}
        categories={followedCategories}
        openCategories={showCategories}
        onOpenCategories={onOpenCategoriesHandler}
      />
    </>
  );
};

export default CategoryBoard;
