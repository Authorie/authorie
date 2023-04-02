import {
  useFollowedCategories,
  useSetFollowedCategories,
} from "@hooks/followedCategories";
import { api } from "@utils/api";
import { useCallback, useState } from "react";
import CategoryBar from "./CategoryBar/CategoryBar";
import CategorySelectionBoard from "./CategorySelectionBoard/CategorySelectionBoard";
import ChapterRankCard from "./ChapterRankCard";

const chapterRanking = [
  {
    chapterId: "1",
    title: "first chap",
    author: "Mr one",
    image: "",
  },
  {
    chapterId: "2",
    title: "second chap",
    author: "Mr two",
    image: "",
  },
  {
    chapterId: "3",
    title: "third chap",
    author: "Mr three",
    image: "",
  },
  {
    chapterId: "4",
    title: "fourth chap",
    author: "Mr four",
    image: "",
  },
  {
    chapterId: "5",
    title: "fifth chap",
    author: "Mr five",
    image: "",
  },
  {
    chapterId: "6",
    title: "sixed chap",
    author: "Mr six",
    image: "",
  },
];

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
          ) : (
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
                  {chapterRanking.map(
                    (chapter, index) =>
                      index === 1 && (
                        <ChapterRankCard
                          key={chapter.chapterId}
                          chapterTitle={chapter.title}
                          authorPenname={chapter.author}
                          image={chapter.image}
                          rank={index + 1}
                          chapterId={chapter.chapterId}
                        />
                      )
                  )}
                  {chapterRanking.map(
                    (chapter, index) =>
                      index === 0 && (
                        <ChapterRankCard
                          key={chapter.chapterId}
                          chapterTitle={chapter.title}
                          authorPenname={chapter.author}
                          image={chapter.image}
                          rank={index + 1}
                          chapterId={chapter.chapterId}
                        />
                      )
                  )}
                  {chapterRanking.map(
                    (chapter, index) =>
                      index === 2 && (
                        <ChapterRankCard
                          key={chapter.chapterId}
                          chapterTitle={chapter.title}
                          authorPenname={chapter.author}
                          image={chapter.image}
                          rank={index + 1}
                          chapterId={chapter.chapterId}
                        />
                      )
                  )}
                </div>
                <div className="flex flex-col gap-5 self-center">
                  {chapterRanking.map(
                    (chapter, index) =>
                      index > 2 &&
                      index <= 5 && (
                        <div
                          key={chapter.chapterId}
                          className="flex w-44 cursor-pointer gap-1 rounded-lg px-2 py-1 text-white hover:bg-dark-500"
                        >
                          <h1 className="font-semibold">{index + 1}.</h1>
                          <div className="mt-0.5 flex flex-col">
                            <h1 className="text-sm font-semibold">
                              {chapter.title}
                            </h1>
                            <p className="text-xs font-light">
                              By {chapter.author}
                            </p>
                          </div>
                        </div>
                      )
                  )}
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
