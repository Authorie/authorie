import Image from "next/image";
import { PhotoIcon } from "@heroicons/react/24/outline";

const CreateBook = () => {
  return (
    <div className="flex w-full gap-5 rounded-lg bg-white px-16 pt-14 pb-7 shadow-lg">
      <div className="relative flex h-52 w-40 items-center justify-center overflow-hidden rounded bg-slate-400">
        <Image src="/favicon.ico" width={100} height={100} alt="dummy-pic" />
        <PhotoIcon className="absolute right-2 bottom-2 h-6 w-6" />
      </div>
      <div className="flex w-full flex-col justify-between">
        <div className="flex w-full flex-col gap-2">
          <PhotoIcon className="h-6 w-6" />
          <input
            type="text"
            className="focus:shadow-outline h-18 w-full bg-transparent text-3xl font-semibold focus:outline-none"
            placeholder="Untitled"
          />
          <textarea
            rows={5}
            className="focus:shadow-outline min-h-auto max-h-24 w-full bg-transparent text-sm focus:outline-none"
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
            <button className="w-6 rounded-full bg-white text-xs">+</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBook;
