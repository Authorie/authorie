import type { Category } from "@prisma/client";
import CategoryChoice from "./CategoryChoice";

type props = {
  categoriesList: Category[] | undefined;
};

const CategorySelectionBoard = ({ categoriesList }: props) => {
  return (
    <div className="flex flex-col gap-5 overflow-y-scroll rounded-lg bg-dark-500 px-7 py-5 text-white shadow-lg">
      <h1 className="text-xl font-semibold">Categories to follow</h1>
      <div className="grid grid-cols-5 gap-4">
        {categoriesList?.map((category) => (
          <CategoryChoice
            id={category.id}
            key={category.id}
            title={category.title}
          />
        ))}
      </div>
    </div>
  );
};

export default CategorySelectionBoard;
