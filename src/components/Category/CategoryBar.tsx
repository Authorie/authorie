import TimeMachine from "@components/TimeMachine/TimeMachine";
import CategoryItem from "./CategoryItem";
import { useState } from "react";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Category } from "@prisma/client";
import { api } from "@utils/api";

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
  const [selectedCategory, setSelectedCategory] = useState<string>("Following");
  const unfollowCategoryMutation = api.category.unfollow.useMutation();
  const onClickHandler = (title: string) => setSelectedCategory(title);

  const onDeleteHandler = (categoryId: string) => {
    unfollowCategoryMutation.mutate(categoryId);
    setSelectedCategory("Following");
  };

  return (
    <div className="flex justify-between bg-dark-600 py-3 px-4">
      <div className="flex">
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
        <div className="flex items-center">
          <CategoryItem
            onDelete={() => {}}
            title={"Following"}
            selected={"Following" === selectedCategory}
            onClick={() => onClickHandler("Following")}
          />
          {categories?.map((category) => (
            <CategoryItem
              onDelete={() => onDeleteHandler(category.id)}
              key={category.id}
              title={category.name}
              selected={category.name === selectedCategory}
              onClick={() => onClickHandler(category.name)}
            />
          ))}
        </div>
      </div>
      <TimeMachine />
    </div>
  );
};

export default CategoryBar;
