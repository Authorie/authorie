import TimeMachine from "@components/TimeMachine/TimeMachine";
import CategoryItem from "./CategoryItem";
import { useState } from "react";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

type props = {
  categories: string[];
  onOpenCategories: () => void;
  openCategories: boolean;
  removeCategory: (title: string) => void;
};

const CategoryBar = ({
  categories,
  onOpenCategories,
  openCategories,
  removeCategory,
}: props) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("Following");
  const onClickHandler = (title: string) => setSelectedCategory(title);

  const onDeleteHandler = (title: string) => {
    removeCategory(title);
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
          {categories.map((category) => (
            <CategoryItem
              onDelete={() => onDeleteHandler(category)}
              key={category}
              title={category}
              selected={category === selectedCategory}
              onClick={() => onClickHandler(category)}
            />
          ))}
        </div>
      </div>
      <TimeMachine />
    </div>
  );
};

export default CategoryBar;
