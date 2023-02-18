import { api } from "@utils/api";
import Choice from "./Choice";
import { Category } from "@prisma/client";

type props = {
  categoriesList: Category[] | undefined;
  onCloseCategories: () => void;
};

const CategoryChoice = ({ categoriesList, onCloseCategories }: props) => {
  const followCategoryMutation = api.category.follow.useMutation();

  return (
    <div className="h-[269px] w-[1100px] overflow-y-scroll rounded-lg bg-dark-500 px-7 py-5 text-white shadow-lg">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Categories to follow</h1>
        <button onClick={onCloseCategories}>close</button>
      </div>
      <div className="grid grid-cols-5 gap-4">
        {categoriesList?.map((category) => (
          <Choice
            key={category.id}
            title={category.name}
            onClick={() => followCategoryMutation.mutate(category.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default CategoryChoice;
