import { useCallback, useState } from "react";
import {
  useFollowedCategories,
  useSetFollowedCategories,
} from "~/hooks/followedCategories";
import { api } from "~/utils/api";
import CategoryBar from "./CategoryBar/CategoryBar";
import CategorySelectionBoard from "./CategorySelectionBoard/CategorySelectionBoard";
import Leaderboard from "./Leaderboard/Leaderboard";

type props = {
  isLogin: boolean;
};

const CategoryBoard = ({ isLogin }: props) => {
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
  }, []);

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
            <Leaderboard />
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
