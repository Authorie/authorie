import BookDummy from "@components/Book/BookDummy";
import ChapterCard from "@components/Chapter/ChapterCard";
import {
  PencilSquareIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
} from "@heroicons/react/24/outline";
import {
  Bars3CenterLeftIcon,
  EyeIcon,
  HeartIcon,
} from "@heroicons/react/24/solid";
import { chapterInfo, bookInfo } from "mocks/search";
import { useRouter } from "next/router";
import Image from "next/image";

const BookContent = () => {
  const router = useRouter();

  return (
    <div className="relative mx-14 my-8 flex flex-col gap-8 rounded-xl bg-white px-7 pt-8 shadow-lg">
      <div className="absolute inset-0 h-96 w-full overflow-hidden rounded-lg rounded-tl-large">
        <Image src="/mockWallpaper.jpeg" fill={true} alt="wallpaper image" />
        <div className="absolute inset-0 z-10 h-96 w-full bg-gradient-to-t from-white" />
      </div>
      <div
        onClick={() => router.back()}
        className="absolute inset-0 top-2 left-2 z-10"
      >
        <ChevronLeftIcon className="h-8 w-8 cursor-pointer rounded-full border border-gray-500 bg-gray-200 p-1 hover:bg-gray-400" />
      </div>
      <div className="z-10 flex gap-7 pt-10 pb-5">
        <div className="ml-7 mb-20 flex flex-col">
          <BookDummy />
          <div className="mt-8 gap-1">
            <div className="mb-3 flex flex-col">
              <h2 className="text-xl font-semibold">{bookInfo[0]?.author}</h2>
              <p className="text-sm font-light">{bookInfo[0]?.category}</p>
            </div>
            <div className="my-7 flex flex-col gap-4">
              <button className="h-10 w-36 rounded-lg bg-gray-800 font-semibold text-white">
                Auction book
              </button>
              <button className="h-10 w-36 rounded-lg bg-gray-800 font-semibold text-white">
                Complete book
              </button>
            </div>
            <div className="my-10 flex flex-col gap-1">
              <span className="text-6xl font-bold">12</span>
              <p className="text-xl font-bold text-authGreen-600">chapters</p>
            </div>
            <div className="flex gap-8">
              <div className="flex flex-col items-center gap-2">
                <p className="text-xl font-bold text-authGreen-600">
                  {bookInfo[0]?.read}
                </p>
                <EyeIcon className="h-5 w-5 text-authGreen-600" />
              </div>
              <div className="flex  flex-col items-center gap-2">
                <p className="text-xl font-bold text-authGreen-600">
                  {bookInfo[0]?.like}
                </p>
                <HeartIcon className="h-5 w-5 text-authGreen-600" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <div className="flex h-52 w-3/5 flex-col justify-center gap-5">
            <div className="flex gap-4">
              <h1 className="text-3xl font-bold">{bookInfo[0]?.title}</h1>
              <PencilSquareIcon className="bg-7 w-7 text-white" />
            </div>
            <p className="text-xs font-light">{bookInfo[0]?.description}</p>
          </div>
          <div className="flex gap-2 self-end">
            <Bars3CenterLeftIcon className="h-7 w-7 rounded-lg bg-gray-200" />
            <MagnifyingGlassIcon className="h-7 w-7 rounded-lg bg-gray-200" />
          </div>
          <div className="mt-3 w-fit flex-1 self-end bg-authGreen-400 shadow-lg">
            <div className="grid w-fit grid-cols-2 gap-x-4 gap-y-1 p-4">
              {chapterInfo.map((data) => (
                <ChapterCard
                  title={data.title}
                  read={data.read}
                  like={data.like}
                  date={data.date}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookContent;
