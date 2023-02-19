import { api } from "@utils/api";

type props = {
  id: string;
  title: string;
};

const CategoryChoice = ({ id, title }: props) => {
  const utils = api.useContext();
  const followCategoryMutation = api.category.follow.useMutation({
    onSuccess: async () => {
      await utils.category.invalidate();
    },
  });
  return (
    <button
      disabled={followCategoryMutation.isLoading}
      onClick={() => followCategoryMutation.mutate(id)}
      className="flex items-center justify-center rounded-3xl bg-authGreen-500 p-3 text-sm font-semibold hover:bg-authGreen-600"
    >
      {followCategoryMutation.isLoading ? (
        <svg
          className="h-4 w-4 animate-spin text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : (
        <span className="whitespace-nowrap">{title}</span>
      )}
    </button>
  );
};

export default CategoryChoice;
