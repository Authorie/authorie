import { Popover } from "@headlessui/react";
import type { ReactNode } from "react";
import { useSession } from "next-auth/react";

type props = {
  isAuthor: boolean;
  inputList: string[];
  popover: ReactNode;
};

const TabInput = ({ isAuthor, inputList, popover }: props) => {
  const { data: session } = useSession();
  const user = session?.user;

  const background = isAuthor ? "bg-authGreen-500" : "bg-authYellow-700";

  return (
    <div className="mb-2 flex max-w-md items-center justify-between gap-2">
      <h5 className="text-sm font-semibold text-gray-500">
        {isAuthor ? "Author :" : "Categories :"}
      </h5>
      <div className={`${background} flex gap-2 rounded-xl px-3 py-1`}>
        <div className="flex w-72 items-center gap-2 overflow-x-scroll">
          {isAuthor && (
            <div className="rounded-full bg-emerald-800 px-5 py-1 text-xs font-semibold text-white">
              {user?.penname}
            </div>
          )}
          {inputList.map(
            (data) =>
              data != "four58" && (
                <button
                  key={data}
                  className="rounded-full bg-gray-500 px-5 py-1 text-xs text-white hover:bg-red-700"
                >
                  {data}
                </button>
              )
          )}
        </div>
        <Popover className="relative">
          <Popover.Panel className="absolute -left-40 bottom-8 z-10">
            {popover}
          </Popover.Panel>
          <Popover.Button className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs hover:bg-gray-200">
            <div className="w-5 rounded-full border-2 border-gray-300 font-bold">
              +
            </div>
          </Popover.Button>
        </Popover>
      </div>
    </div>
  );
};

export default TabInput;
