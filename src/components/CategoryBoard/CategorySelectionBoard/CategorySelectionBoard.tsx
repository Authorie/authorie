import type { Category } from "@prisma/client";
import CategoryChoice from "./CategoryChoice";
import { api } from "@utils/api";
import { useFollowCategory } from "@hooks/followedCategories";

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
  const utils = api.useContext();
  const followCategory = useFollowCategory();
  const followCategoryMutation = api.category.follow.useMutation({
    onSuccess: async () => {
      await utils.category.invalidate();
    },
  });

  const followHandler = (category: Category) => {
    if (isLogin) {
      followCategoryMutation.mutate(category.id);
    } else {
      followCategory(category);
    }
  };

  const categories = isLogin
    ? categoriesList
    : categoriesList?.filter((c) => !followedCategories.includes(c));

  return (
    <div className="flex h-full w-full flex-col gap-5 overflow-y-auto rounded-lg bg-dark-500 px-7 py-5 text-white shadow-lg">
      <h1 className="text-xl font-semibold">Categories to follow</h1>
      <div className="grid grid-cols-5 gap-4">
        {categories?.map((category) => (
          <CategoryChoice
            key={category.id}
            category={category}
            isLoading={followCategoryMutation.isLoading}
            onClick={() => followHandler(category)}
          />
        ))}
      </div>
    </div>
  );
};

export default CategorySelectionBoard;
