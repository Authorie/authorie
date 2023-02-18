import Choice from "./Choice";
import { useState } from "react";

type props = {
  categoriesList: string[];
  onCloseCategories: () => void;
};

const CategoryChoice = ({ categoriesList, onCloseCategories }: props) => {
  const onClickHandler = () => {
    console.log("hi");
  };

  return (
    <div className="h-[269px] w-[1100px] overflow-y-scroll rounded-lg bg-dark-500 px-7 py-5 text-white shadow-lg">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Categories to follow</h1>
        <button onClick={onCloseCategories}>close</button>
      </div>
      <div className="grid grid-cols-5 gap-4">
        {categoriesList.map((data) => (
          <Choice key={data} title={data} onClick={onClickHandler} />
        ))}
      </div>
    </div>
  );
};

export default CategoryChoice;
