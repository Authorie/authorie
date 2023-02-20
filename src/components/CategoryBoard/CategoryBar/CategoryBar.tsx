import CategoryItem from "./CategoryItem";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import type { Category } from "@prisma/client";

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
  return (
    <div className="flex gap-3 overflow-auto bg-dark-600 py-3 px-4">
      <button
        title="Open Categories"
        type="button"
        onClick={onOpenCategories}
        className={`flex aspect-square items-center justify-center rounded-full px-2 text-white ${
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
      <CategoryItem isLogin={isLogin} category="all" />
      {isLogin && <CategoryItem isLogin={isLogin} category="following" />}
      {categories?.map((category) => (
        <CategoryItem key={category.id} isLogin={isLogin} category={category} />
      ))}
    </div>
  );
};

export default CategoryBar;
