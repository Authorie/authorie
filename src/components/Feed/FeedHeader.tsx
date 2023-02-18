import CategoryBar from "@components/Category/CategoryBar";
import CategoryChoice from "@components/Category/CategoryChoice";
import { useState } from "react";

const FeedHeader = () => {
  const [showCategories, setShowCategories] = useState<boolean>(false);

  const onToggleChoices = () => {
    setShowCategories(() => !showCategories);
  };

  const onCloseChoices = () => {
    setShowCategories(false);
  };

  return (
    <div className="my-4 flex h-[329px] w-[1100px] flex-col overflow-hidden rounded-xl bg-neutral-500">
      <div className="flex h-[269px] items-center justify-center rounded-xl bg-dark-600">
        {!showCategories ? (
          <h1 className="text-8xl text-white">For Ads</h1>
        ) : (
          <CategoryChoice onCloseCategories={onCloseChoices} />
        )}
      </div>
      <div className="h-[10px]" />
      <CategoryBar
        openCategories={showCategories}
        onOpenCategories={onToggleChoices}
        categories={["Following", "Programming", "Business", "Writing"]}
      />
    </div>
  );
};

export default FeedHeader;
