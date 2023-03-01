import { useCallback, useState } from "react";
import CategorySelectionBoard from "./CategorySelectionBoard/CategorySelectionBoard";
import CategoryBar from "./CategoryBar/CategoryBar";
import {
  useFollowedCategories,
  useSetFollowedCategories,
} from "@hooks/followedCategories";
import { api } from "@utils/api";

type props = {
  isLogin: boolean;
};

const CategoryBoard = ({ isLogin }: props) => {
  const followedCategories = useFollowedCategories();
  const setFollowedCategories = useSetFollowedCategories();
  const [showCategories, setShowCategories] = useState(false);
  const { data: categories } = api.category.getAll.useQuery();
  api.category.getFollowed.useQuery(undefined, {
    enabled: isLogin,
    onSuccess(data) {
      setFollowedCategories(data);
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
            <h1 className="text-8xl text-white">For Ads</h1>
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
