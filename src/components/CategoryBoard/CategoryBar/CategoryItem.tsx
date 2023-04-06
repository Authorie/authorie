import LoadingSpinner from "~/components/ui/LoadingSpinner";
import type { Category } from "@prisma/client";
import { api } from "~/utils/api";
import { HiOutlineXMark } from "react-icons/hi2";
import { useUnfollowCategory } from "~/hooks/followedCategories";
import { useSelectCategory } from "~/hooks/selectedCategory";

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
        className="px-4 py-2"
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
          className="disable:bg-gray-500 absolute -left-2 -top-1 hidden items-center justify-center rounded-full bg-red-400 p-1 hover:bg-red-500 group-hover/categoryItem:flex"
        >
          {unfollowCategoryMutation.isLoading ? (
            <LoadingSpinner />
          ) : (
            <HiOutlineXMark className="h-3 w-3 stroke-[4px]" />
          )}
        </button>
      )}
    </div>
  );
};

export default CategoryItem;
