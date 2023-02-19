import CategoryItem from "./CategoryItem";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import type { Category } from "@prisma/client";
import { api } from "@utils/api";
import {
  useSelectCategory,
  useSelectedCategory,
} from "@hooks/selectedCategory";
import { useUnfollowCategory } from "@hooks/followedCategories";

type props = {
  isLogin: boolean;
  categories: Category[] | undefined;
  onOpenCategories: () => void;
  openCategories: boolean;
};

const CategoryBar = ({
  isLogin,
  categories,
  onOpenCategories,
  openCategories,
}: props) => {
  const utils = api.useContext();
  const selectCategory = useSelectCategory();
  const selectedCategory = useSelectedCategory();
  const unfollowCategory = useUnfollowCategory();
  const unfollowCategoryMutation = api.category.unfollow.useMutation({
    onSuccess: () => {
      void utils.category.invalidate();
    },
  });

  const onDeleteHandler = (category: Category) => {
    if (isLogin) {
      unfollowCategoryMutation.mutate(category.id);
      if (selectedCategory === category) {
        selectCategory("following");
      }
    } else {
      unfollowCategory(category);
    }
  };

  return (
    <div className="flex gap-3 bg-dark-600 py-3 px-4">
      <button
        title="Open Categories"
        type="button"
        onClick={onOpenCategories}
        className={`flex aspect-square h-full items-center justify-center rounded-full p-2 text-white ${
          openCategories
            ? "bg-yellow-700 hover:bg-yellow-800"
            : "bg-black hover:bg-dark-500"
        }`}
      >
        {openCategories ? (
          <XMarkIcon className="h-4 w-4" />
        ) : (
          <PlusIcon className="h-4 w-4" />
        )}
      </button>
      <div className="flex gap-3 overflow-x-auto">
        <CategoryItem
          title={"All"}
          selected={selectedCategory === "all"}
          onClick={() => selectCategory("all")}
        />
        {isLogin && (
          <CategoryItem
            title={"Following"}
            selected={selectedCategory === "following"}
            onClick={() => selectCategory("following")}
          />
        )}
        {categories?.map((category) => (
          <CategoryItem
            key={category.id}
            title={category.title}
            selected={
              selectedCategory !== "all" &&
              selectedCategory !== "following" &&
              category.id === selectedCategory.id
            }
            onClick={() => selectCategory(category)}
            deleteProps={{
              loading: unfollowCategoryMutation.isLoading,
              onClick: () => onDeleteHandler(category),
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default CategoryBar;
