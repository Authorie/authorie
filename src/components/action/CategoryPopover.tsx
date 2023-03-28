import type { Category } from "@prisma/client";
import { Popover } from "@headlessui/react";

type props = {
  isEdit: boolean;
  addedCategories: Category[];
  categories: Category[];
  toggleCategoryHandler: (category: Category) => void;
};

export const CategoryPopover = ({
  isEdit,
  addedCategories,
  categories,
  toggleCategoryHandler,
}: props) => {
  return (
    <>
      {isEdit && (
        <div className="flex flex-col-reverse gap-2">
          <div className="flex flex-col items-start gap-2 overflow-x-auto rounded-xl">
            {addedCategories.length === 0 && <div className="h-5" />}
            {addedCategories.map((category) => (
              <span
                key={category.id}
                onClick={() => toggleCategoryHandler(category)}
                className="cursor-pointer select-none whitespace-nowrap rounded-full bg-authYellow-500 px-2 py-0.5 text-xs text-white hover:bg-red-600"
              >
                {category.title}
              </span>
            ))}
          </div>
          {categories && (
            <Popover className="relative">
              <Popover.Panel className="absolute left-32 top-0 z-10">
                <div className="grid w-max grid-cols-2 gap-2 rounded-xl bg-gray-200 p-2">
                  {categories
                    .filter(
                      ({ id }) => !addedCategories.some((e) => e.id === id)
                    )
                    .map((category) => (
                      <button
                        type="button"
                        key={category.id}
                        onClick={() => toggleCategoryHandler(category)}
                        className="flex w-36 items-center justify-center rounded-lg bg-white p-2 text-xs font-bold shadow-md hover:bg-gray-300"
                      >
                        {category.title}
                      </button>
                    ))}
                  {categories.filter(
                    (category: Category) => !addedCategories.includes(category)
                  ).length === 0 && (
                    <p className="text-sm font-semibold">
                      No more categories left...
                    </p>
                  )}
                </div>
              </Popover.Panel>
              <Popover.Button
                className="rounded-lg border border-authGreen-400 py-2 px-3 text-sm font-semibold text-authGreen-500 hover:border-authGreen-600 hover:bg-authGreen-600 hover:text-white"
                type="button"
              >
                Add categories
              </Popover.Button>
            </Popover>
          )}
        </div>
      )}
    </>
  );
};
