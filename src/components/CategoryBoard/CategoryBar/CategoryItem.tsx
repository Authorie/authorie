import { XMarkIcon } from "@heroicons/react/24/outline";
import { useUnfollowCategory } from "@hooks/followedCategories";
import { useSelectCategory } from "@hooks/selectedCategory";
import type { Category } from "@prisma/client";
import { api } from "@utils/api";

type props = {
  isLogin: boolean;
  selected: boolean;
  category: "all" | "following" | Category;
};

const CategoryItem = ({ isLogin, selected, category }: props) => {
  const utils = api.useContext();
  const selectCategory = useSelectCategory();
  const unfollowCategory = useUnfollowCategory();
  const unfollowCategoryMutation = api.category.unfollow.useMutation({
    onSuccess: () => {
      void utils.category.invalidate();
    },
  });
  const isValidCategory = typeof category !== "string";

  const onDeleteHandler = () => {
    if (!isValidCategory) {
      return;
    }

    if (isLogin) {
      unfollowCategoryMutation.mutate(category.id);
      if (selected) {
        selectCategory("following");
      }
    } else {
      unfollowCategory(category);
      if (selected) {
        selectCategory("all");
      }
    }
  };

  return (
    <div
      className={`group/categoryItem relative rounded-3xl text-sm text-white ${
        selected
          ? "bg-yellow-700 hover:bg-yellow-800"
          : "bg-black hover:bg-dark-500"
      }`}
    >
      <button
        title="Select Category for Posts"
        type="button"
        onClick={() => selectCategory(category)}
        className="py-2 px-4"
      >
        <span className="whitespace-nowrap">
          {category === "all"
            ? "All"
            : category === "following"
            ? "Following"
            : category.title}
        </span>
      </button>
      {isValidCategory && (
        <button
          title="Unfollow Category"
          type="button"
          disabled={unfollowCategoryMutation.isLoading}
          onClick={onDeleteHandler}
          className="disable:bg-gray-500 absolute -top-1 -left-2 hidden items-center justify-center rounded-full bg-red-400 p-1 hover:bg-red-500 group-hover/categoryItem:flex"
        >
          {unfollowCategoryMutation.isLoading ? (
            <svg
              className="h-3 w-3 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            <XMarkIcon className="h-3 w-3 stroke-[4px]" />
          )}
        </button>
      )}
    </div>
  );
};

export default CategoryItem;
