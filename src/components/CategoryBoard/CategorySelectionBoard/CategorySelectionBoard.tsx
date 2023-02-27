import type { Category } from "@prisma/client";
import CategoryChoice from "./CategoryChoice";

type props = {
  isLogin: boolean;
  categoriesList: Category[] | undefined;
  followedCategories: Category[];
};

const CategorySelectionBoard = ({
  isLogin,
  categoriesList,
  followedCategories,
}: props) => {
  const categories = isLogin
    ? categoriesList
    : categoriesList?.filter((c) => !followedCategories.includes(c));

  return (
    <div className="flex h-full w-full flex-col gap-5 overflow-y-auto rounded-xl bg-dark-500 px-7 py-5 text-white shadow-lg">
      <h1 className="text-xl font-semibold">Categories to follow</h1>
      <div className="grid grid-cols-5 gap-4">
        {categories?.map((category) => (
          <CategoryChoice
            key={category.id}
            isLogin={isLogin}
            category={category}
          />
        ))}
      </div>
    </div>
  );
};

export default CategorySelectionBoard;
