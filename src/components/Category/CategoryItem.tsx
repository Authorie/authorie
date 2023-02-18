type props = {
  title: string;
  selected: boolean;
  onClick: () => void;
  onDelete: () => void;
};

const CategoryItem = ({ title, selected, onClick, onDelete }: props) => {
  let className = " hover:bg-dark-400";
  if (selected) {
    className = "bg-yellow-700 hover:bg-yellow-800";
  }

  return (
    <div
      className={`group/categoryItem font-regular + relative ml-3 rounded-3xl text-sm text-white ${className}`}
    >
      <button onClick={onClick} className="py-[7px] px-4">
        <span className="text-white group-hover:text-black">{title}</span>
      </button>
      {title != "Following" && (
        <button
          onClick={onDelete}
          className="invisible absolute right-[-5%] top-[-25%] rounded-full bg-red-400 px-2 text-[8px] text-white hover:bg-red-500 group-hover/categoryItem:visible"
        >
          x
        </button>
      )}
    </div>
  );
};

export default CategoryItem;
