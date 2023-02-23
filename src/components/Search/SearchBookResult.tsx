import Image from "next/image";
import { BookOpenIcon } from "@heroicons/react/24/solid";

type props = {
  title: string;
  date: Date;
  author: string;
  description: string;
};

const SearchBookResult = ({ title, date, author, description }: props) => {
  const onClickCard = () => {
    console.log("redirect!");
  };

  return (
    <div
      onClick={onClickCard}
      className="mb-3 flex h-44 cursor-pointer gap-4 rounded shadow-lg transition duration-300 ease-in-out hover:-translate-y-1 hover:scale-[1.01]"
    >
      <div className="flex w-2/12 items-center justify-center rounded-l bg-authGreen-500">
        <BookOpenIcon className="h-12 w-12 fill-white" />
      </div>
      <div className="w-8/12 py-3">
        <p className="text-xs font-semibold text-authGreen-500">BOOK</p>
        <h1 className="text-2xl font-bold text-authGreen-500">{title}</h1>
        <div className="flex gap-24 text-xs text-dark-400">
          <p>{`publish : ${date.toLocaleDateString()}`}</p>
          <p>{`author : ${author}`}</p>
        </div>
        <p className="my-4 text-xs text-dark-600">{description}</p>
      </div>
      <div className="flex w-2/12 items-center justify-center">
        <div className="overflow-hidden rounded-full">
          <Image src="/favicon.ico" width={100} height={100} alt="dummy-pic" />
        </div>
      </div>
    </div>
  );
};

export default SearchBookResult;
