import CategoryBar from "@components/Category/CategoryBar";
import CategoryChoice from "@components/Category/CategoryChoice";
import { useState } from "react";

const FeedHeader = () => {
  const categories: string[] = [
    "Fiction",
    "Non-fiction",
    "Horror",
    "Entertainment",
    "Study",
    "Animals and Pets",
    "Business and Economics",
    "Cryptocurrency",
    "Stock investment",
    "Technical Analysis",
    "Fundamental Analysis",
    "Fiction",
    "Non-fiction",
    "Horror",
    "Entertainment",
    "Study",
    "Animals and Pets",
    "Business and Economics",
    "Cryptocurrency",
    "Stock investment",
    "Technical Analysis",
    "Fundamental Analysis",
  ];

  const [userCategories, setUserCategories] = useState([
    "Following",
    "Programming",
    "Business",
    "Writing",
  ]);

  const [showCategories, setShowCategories] = useState<boolean>(false);

  const onToggleChoices = () => {
    setShowCategories(() => !showCategories);
  };

  const onCloseChoices = () => {
    setShowCategories(false);
  };

  //Todo: add category to the user list.
  //const addCategory = () => {};

  //Todo: remove category list that the user follow
  const removeCategory = (title: string) => {
    //const catIdx = userCategories.findIndex((data) => data === title);
    console.log("title = ", title);
    const result = userCategories.filter(
      (userCategory) => userCategory !== title
    );
    setUserCategories(result);
  };

  // const removeCategory = (title: string) => {
  //   console.log("worked!");
  // };

  return (
    <div className="my-4 flex h-[329px] w-[1100px] flex-col overflow-hidden rounded-xl bg-neutral-500">
      <div className="flex h-[269px] items-center justify-center rounded-xl bg-dark-600">
        {!showCategories ? (
          <h1 className="text-8xl text-white">For Ads</h1>
        ) : (
          <CategoryChoice
            categoriesList={categories}
            onCloseCategories={onCloseChoices}
          />
        )}
      </div>
      <div className="h-[10px]" />
      <CategoryBar
        removeCategory={removeCategory}
        openCategories={showCategories}
        onOpenCategories={onToggleChoices}
        categories={userCategories}
      />
    </div>
  );
};

export default FeedHeader;
