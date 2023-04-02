import {
  useFollowedCategories,
  useSetFollowedCategories,
} from "@hooks/followedCategories";
import { api } from "@utils/api";
import { useCallback, useState } from "react";
import CategoryBar from "./CategoryBar/CategoryBar";
import CategorySelectionBoard from "./CategorySelectionBoard/CategorySelectionBoard";
import ChapterRankCard from "./ChapterRankCard";
import { HiEye } from "react-icons/hi2";
import { useRouter } from "next/router";

type props = {
  isLogin: boolean;
};

const CategoryBoard = ({ isLogin }: props) => {
  const month = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const { data: leaderboard } = api.chapter.getLeaderboard.useQuery({
    limit: 6,
  });
  const chapters = api.useQueries((t) =>
    leaderboard
      ? leaderboard?.map((id) => t.chapter.getData({ id: id.chapterId }))
      : []
  );
  const router = useRouter();
  const d = new Date();
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
          ) : leaderboard ? (
            <div className="flex h-full w-full justify-between px-10 py-5">
              <div className="flex flex-col gap-3">
                <div className="w-24 font-bold text-white">
                  <span className="text-4xl">Best</span>{" "}
                  <span className="text-2xl">Article of the</span>{" "}
                  <span className="text-4xl">Month</span>
                </div>
                <span className="text-xl font-semibold text-authGreen-400">
                  {month[d.getMonth()]}
                </span>
              </div>
              <div className="flex gap-10">
                <div className="flex gap-4">
                  {chapters.map(
                    ({ data: chapter }, index) =>
                      index === 1 && (
                        <ChapterRankCard
                          key={chapter?.id}
                          chapterTitle={chapter?.title as string}
                          authorPenname={chapter?.owner.penname as string}
                          image={chapter?.book?.coverImage || ""}
                          rank={index + 1}
                          chapterId={chapter?.id as string}
                          read={chapter?._count.views || 0}
                        />
                      )
                  )}
                  {chapters.map(
                    ({ data: chapter }, index) =>
                      index === 0 && (
                        <ChapterRankCard
                          key={chapter?.id}
                          chapterTitle={chapter?.title as string}
                          authorPenname={chapter?.owner.penname as string}
                          image={chapter?.book?.coverImage || ""}
                          rank={index + 1}
                          chapterId={chapter?.id as string}
                          read={chapter?._count.views || 0}
                        />
                      )
                  )}
                  {chapters.map(
                    ({ data: chapter }, index) =>
                      index === 2 && (
                        <ChapterRankCard
                          key={chapter?.id}
                          chapterTitle={chapter?.title as string}
                          authorPenname={chapter?.owner.penname as string}
                          image={chapter?.book?.coverImage || ""}
                          rank={index + 1}
                          chapterId={chapter?.id as string}
                          read={chapter?._count.views || 0}
                        />
                      )
                  )}
                </div>
                <div className="flex flex-col gap-5 self-center">
                  {chapters.map(
                    ({ data: chapter }, index) =>
                      index > 2 &&
                      index <= 5 && (
                        <div
                          key={chapter?.id}
                          onClick={() =>
                            void router.push(
                              `/chapter/${chapter?.id as string}`
                            )
                          }
                          className="flex w-56 cursor-pointer gap-1 rounded-lg px-2 py-1 text-white hover:bg-dark-500"
                        >
                          <h1 className="font-semibold">{index + 1}.</h1>
                          <div className="mt-0.5 flex w-full flex-col gap-1">
                            <h1 className="text-sm font-semibold">
                              {chapter?.title}
                            </h1>
                            <p className="text-xs font-light">
                              By {chapter?.owner.penname}
                            </p>
                          </div>
                          <div className="flex w-fit items-center gap-1 rounded-lg bg-gray-700 px-2 shadow-lg">
                            <HiEye className="h-3 w-3 text-white" />
                            <p className="text-xs text-white">
                              {chapter?._count.views}
                            </p>
                          </div>
                        </div>
                      )
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex">
              <h1 className="text-4xl font-bold text-white">
                Ranking has not started yet!
              </h1>
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
