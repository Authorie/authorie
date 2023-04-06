import LoadingSpinner from "@components/ui/LoadingSpinner";
import { useFollowCategory } from "@hooks/followedCategories";
import type { Category } from "@prisma/client";
import { api } from "@utils/api";

type props = {
  isLogin: boolean;
  category: Category;
};

const CategoryChoice = ({ isLogin, category }: props) => {
  const utils = api.useContext();
  const followCategory = useFollowCategory();
  const followCategoryMutation = api.category.follow.useMutation({
    onSuccess: async () => {
      await utils.category.invalidate();
    },
  });

  const onClickHandler = () => {
    if (isLogin) {
      followCategoryMutation.mutate(category.id);
    } else {
      followCategory(category);
    }
  };

  return (
    <button
      disabled={followCategoryMutation.isLoading}
      onClick={onClickHandler}
      className="flex items-center justify-center rounded-lg border-2 border-authGreen-500 py-1 text-sm hover:bg-authGreen-600"
    >
      {followCategoryMutation.isLoading ? (
        <LoadingSpinner />
      ) : (
        <span className="whitespace-nowrap">{category.title}</span>
      )}
    </button>
  );
};

export default CategoryChoice;
