import Image from "next/image";
import { useRouter } from "next/router";
import { HiEye } from "react-icons/hi2";

type props = {
  chapterTitle: string;
  image: string | null;
  authorPenname: string;
  rank: number;
  chapterId: string;
  read: number;
};

const ChapterRankCard = ({
  chapterTitle,
  image,
  authorPenname,
  rank,
  chapterId,
  read,
}: props) => {
  const router = useRouter();
  return (
    <div
      onClick={() => void router.push(`/chapter/${chapterId}`)}
      className={`${rank === 1 ? "self-start" : ""} ${
        rank === 3 ? "mt-12" : ""
      } ${
        rank === 2 ? "mt-6" : ""
      } relative h-52 w-36 cursor-pointer transition duration-100 ease-in-out hover:-translate-y-1 hover:scale-[1.01]`}
    >
      <div className="h-full w-full overflow-hidden rounded-sm shadow-lg">
        {image ? (
          <Image
            src={image}
            alt={`${chapterTitle}'s cover image`}
            width={170}
            height={220}
          />
        ) : (
          <div className="h-52 w-36 bg-authGreen-500" />
        )}
        <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-gray-600 px-2">
          <HiEye className="h-3 w-3 text-white" />
          <p className="text-xs text-white">{read}</p>
        </div>
        <div
          className={`absolute left-2 top-28 z-10 h-32 w-32 rounded-md p-2 shadow-xl backdrop-blur-2xl ${
            rank === 1 ? "bg-gold/60" : ""
          }${rank === 2 ? "bg-dark-300/60" : ""}${
            rank === 3 ? "bg-rose-400/60" : ""
          }`}
        >
          <div className="flex h-full flex-col justify-between">
            <div className="flex justify-between">
              <h1 className="line-clamp-2 text-lg font-semibold leading-5 text-white">
                {chapterTitle}
              </h1>
              <h1 className="h-fit text-3xl font-bold text-white drop-shadow-md">
                #{rank}
              </h1>
            </div>
            <p className="text-xs text-white">By {authorPenname}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChapterRankCard;
