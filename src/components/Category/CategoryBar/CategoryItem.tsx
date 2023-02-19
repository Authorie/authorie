import { XMarkIcon } from "@heroicons/react/24/outline";

type props = {
  title: string;
  selected: boolean;
  onClick: () => void;
  deleteProps?: {
    loading: boolean;
    onClick: () => void;
  };
};

const CategoryItem = ({ title, selected, onClick, deleteProps }: props) => {
  return (
    <div
      className={`group/categoryItem font-regular relative rounded-3xl text-sm text-white ${
        selected
          ? "bg-yellow-700 hover:bg-yellow-800"
          : "bg-black hover:bg-dark-500"
      }`}
    >
      <button
        title="Select Category for Posts"
        type="button"
        onClick={onClick}
        className="py-2 px-4"
      >
        <span className="whitespace-nowrap text-white group-hover:text-black">
          {title}
        </span>
      </button>
      {deleteProps && title.toLowerCase() != "following" && (
        <button
          title="Unfollow Category"
          type="button"
          disabled={deleteProps.loading}
          onClick={deleteProps.onClick}
          className="disable:bg-gray-500 absolute -top-1 -left-2 hidden items-center justify-center rounded-full bg-red-400 p-1 text-white hover:bg-red-500 group-hover/categoryItem:flex"
        >
          {deleteProps.loading ? (
            <svg
              className="h-3 w-3 animate-spin text-white"
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
                stroke-width="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            <XMarkIcon className="h-3 w-3 stroke-2" />
          )}
        </button>
      )}
    </div>
  );
};

export default CategoryItem;
