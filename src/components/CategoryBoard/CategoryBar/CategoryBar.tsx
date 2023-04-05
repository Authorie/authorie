import { useSelectedCategory } from "@hooks/selectedCategory";
import type { Category } from "@prisma/client";
import { HiOutlinePlus, HiOutlineXMark } from "react-icons/hi2";
import CategoryItem from "./CategoryItem";
import { TimeMachine } from "@components/action/TimeMachine";

type props = {
  isLogin: boolean;
  categories: Category[] | undefined;
  onOpenCategories: () => void;
  openCategories: boolean;
  refetchFeed: (date: Date) => void;
};

const CategoryBar = ({
  isLogin,
  categories,
  onOpenCategories,
  openCategories,
  refetchFeed,
}: props) => {
  const selectedCategory = useSelectedCategory();

  return (
    <div className="sticky top-0 z-20 mb-6 flex max-w-5xl justify-between rounded-b-xl bg-dark-600 px-4 py-3">
      <div className="flex items-center gap-3 overflow-x-auto">
        <button
          title="Open Categories"
          type="button"
          onClick={onOpenCategories}
          className={`h-210 flex aspect-square w-9 items-center justify-center rounded-full text-white ${
            openCategories
              ? "bg-yellow-700 hover:bg-yellow-800"
              : "bg-black hover:bg-dark-500"
          }`}
        >
          {openCategories ? (
            <HiOutlineXMark className="h-4 w-4" />
          ) : (
            <HiOutlinePlus className="h-4 w-4" />
          )}
        </button>
        <CategoryItem
          isLogin={isLogin}
          selected={selectedCategory === "all"}
          category="all"
        />
        {isLogin && (
          <CategoryItem
            isLogin={isLogin}
            selected={selectedCategory === "following"}
            category="following"
          />
        )}
        {categories?.map((category) => (
          <CategoryItem
            key={category.id}
            isLogin={isLogin}
            selected={selectedCategory === category}
            category={category}
          />
        ))}
      </div>
      <TimeMachine refetchFeed={(date: Date) => void refetchFeed(date)} />
    </div>
  );
};

export default CategoryBar;
