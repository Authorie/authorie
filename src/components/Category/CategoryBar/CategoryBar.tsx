import dynamic from "next/dynamic";
import CategoryItem from "./CategoryItem";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Category } from "@prisma/client";
import { api } from "@utils/api";
import { useSelectCategory, useSelectedCategory } from "@hooks/category";

type props = {
  categories: Category[] | undefined;
  onOpenCategories: () => void;
  openCategories: boolean;
};

const CategoryBar = ({
  categories,
  onOpenCategories,
  openCategories,
}: props) => {
  const utils = api.useContext();
  const selectCategory = useSelectCategory();
  const selectedCategory = useSelectedCategory();
  const unfollowCategoryMutation = api.category.unfollow.useMutation({
    onSuccess: async () => {
      await utils.category.invalidate();
    },
  });

  const onDeleteHandler = async (categoryId: string) => {
    await unfollowCategoryMutation.mutateAsync(categoryId);
    selectCategory("following");
  };

  return (
    <div className="flex gap-3 bg-dark-600 py-3 px-4">
      <button
        title="Open Categories"
        type="button"
        onClick={onOpenCategories}
        className={`flex aspect-square h-full items-center justify-center rounded-full text-white ${
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
      <CategoryItem
        title={"Following"}
        selected={selectedCategory === "following"}
        onClick={() => selectCategory("following")}
      />
      {categories?.map((category) => (
        <CategoryItem
          key={category.id}
          title={category.name}
          selected={
            selectedCategory !== "following" &&
            category.id === selectedCategory.id
          }
          onClick={() => selectCategory(category)}
          deleteProps={{
            loading: unfollowCategoryMutation.isLoading,
            onClick: () => onDeleteHandler(category.id),
          }}
        />
      ))}
    </div>
  );
};

export default CategoryBar;
