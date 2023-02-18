import { XMarkIcon } from "@heroicons/react/24/outline";

type props = {
  title: string;
  selected: boolean;
  onClick: () => void;
  onDelete: () => void;
};

const CategoryItem = ({ title, selected, onClick, onDelete }: props) => {
  return (
    <div
      className={`group/categoryItem font-regular relative ml-3 rounded-3xl text-sm text-white ${
        selected
          ? "bg-yellow-700 hover:bg-yellow-800"
          : "bg-black hover:bg-dark-500"
      }`}
    >
      <button onClick={onClick} className="py-2 px-4">
        <span className="text-white group-hover:text-black">{title}</span>
      </button>
      {selected && title != "Following" && (
        <button
          onClick={onDelete}
          className="absolute -top-1 -left-2 hidden items-center justify-center rounded-full bg-red-400 p-1 text-white hover:bg-red-500 group-hover/categoryItem:flex"
        >
          <XMarkIcon className="h-3 w-3 stroke-2" />
        </button>
      )}
    </div>
  );
};

export default CategoryItem;
