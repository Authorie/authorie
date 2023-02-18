import TimeMachine from "@components/TimeMachine/TimeMachine";
import CategoryItem from "./CategoryItem";
import { useState } from "react";

type props = {
  categories: string[];
  onOpenCategories: () => void;
  openCategories: boolean;
};

const CategoryBar = ({
  categories,
  onOpenCategories,
  openCategories,
}: props) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("Following");
  const onClickHandler = (title: string) => setSelectedCategory(title);

  let className =
    "rounded-full px-[12px] py-[5px] bg-black text-white hover:bg-dark-500";
  if (openCategories) {
    className =
      "rounded-full bg-yellow-700 px-[12px] py-[5px] text-white hover:bg-yellow-800";
  }

  return (
    <div className="flex justify-between bg-dark-600 py-3 px-4">
      <div className="flex">
        <button onClick={onOpenCategories} className={className}>
          +
        </button>
        <div className="flex items-center">
          {categories.map((category) => (
            <CategoryItem
              key={category}
              title={category}
              selected={category === selectedCategory}
              onClick={() => onClickHandler(category)}
            />
          ))}
        </div>
      </div>
      <TimeMachine />
    </div>
  );
};

export default CategoryBar;
