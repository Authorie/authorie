import Image from "next/legacy/image";
import { PhotoIcon } from "@heroicons/react/24/outline";
import AddAuthorModal from "./AddAuthorModal";
import { Popover } from "@headlessui/react";

const CreateBook = () => {
  return (
    <div className="relative flex w-full gap-5 rounded-lg px-16 pt-20 pb-7 shadow-lg">
      <div className="absolute inset-0 h-4/6 w-full overflow-hidden rounded-t-lg">
        <Image src="/mockWallpaper.jpeg" layout="fill" alt="book's wallpaper" />
        <div className="-z-1 absolute inset-0 h-full w-full bg-gradient-to-t from-white" />
      </div>
      <div className="relative flex h-52 w-48 items-center justify-center overflow-hidden rounded">
        <label className="cursor-pointer" htmlFor="book-profile">
          <Image src="/favicon.ico" layout="fill" alt="dummy-pic" />
          <PhotoIcon className="absolute right-2 bottom-2 h-6 w-6" />
        </label>
        <input
          type="file"
          id="book-profile"
          className="none"
          accept="image/png, image/jpeg"
        />
      </div>
      <div className="z-0 flex w-full flex-col justify-end">
        <div className="flex w-full flex-col gap-2">
          <PhotoIcon className="h-6 w-6" />
          <input
            type="text"
            className="focus:shadow-outline h-18 w-full bg-transparent text-3xl font-semibold focus:outline-none"
            placeholder="Untitled"
          />
          <textarea
            rows={4}
            className="focus:shadow-outline max-h-16 w-full bg-transparent text-sm focus:outline-none"
            placeholder="write the description down..."
          />
        </div>
        <div className="flex items-center gap-2">
          <h5 className="text-sm font-semibold">Author :</h5>
          <div className="flex gap-2 rounded-xl bg-authGreen-500 px-3 py-1">
            <button className="rounded-full bg-gray-600 px-5 py-1 text-xs font-semibold text-white">
              Lorem napkin
            </button>
            <button className="rounded-full bg-gray-500 px-2 text-xs text-white">
              NongFameza
            </button>
            <Popover className="relative">
              <Popover.Panel className="absolute -left-20 bottom-8 z-10">
                <AddAuthorModal />
              </Popover.Panel>
              <Popover.Button className="h-6 w-6 rounded-full bg-white text-xs">
                +
              </Popover.Button>
            </Popover>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBook;
