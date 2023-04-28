import type { RouterOutputs } from "~/utils/api";
import { DateLabel } from "../action/DateLabel";
import Image from "next/image";
import { useRouter } from "next/router";

type props = {
  chapter: RouterOutputs["chapter"]["getData"];
};

const ChapterPurchased = ({ chapter }: props) => {
  const router = useRouter();
  return (
    <div
      onClick={() => void router.push(`/chapter/${chapter.id}`)}
      className="relative flex h-72 w-52 cursor-pointer flex-col overflow-hidden rounded-lg bg-white p-2 shadow-lg transition duration-100 ease-in-out hover:-translate-y-1 hover:scale-[1.01]"
    >
      {chapter.book?.coverImage && (
        <Image
          src={chapter.book?.coverImage}
          fill
          className="absolute object-cover"
          alt="book's cover"
        />
      )}
      {chapter.publishedAt && (
        <div className="z-10 h-fit w-fit rounded-lg bg-white/90 px-1">
          <DateLabel date={chapter.publishedAt} withTime={false} size={"xs"} />
        </div>
      )}
      <div className="z-10 flex h-full flex-col justify-between">
        <div className="mt-3 flex flex-col items-center gap-2">
          <p className="line-clamp-1 rounded-lg bg-white/90 px-2 py-1 text-center text-xs font-semibold text-gray-600">
            Book: {chapter.book?.title}
          </p>
          <p className="line-clamp-4 rounded-lg bg-white/90 px-2 py-1 text-center text-2xl font-semibold text-gray-700">
            {chapter.title}
          </p>
        </div>
        <div className="flex flex-col items-start gap-1">
          <p className="rounded-lg bg-white/90 px-1 py-1 text-sm font-semibold text-gray-600">
            By {chapter.owner.penname}
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 rounded-lg bg-white/90 px-1">
              <span className="text-xs font-semibold text-authGreen-600">
                {chapter._count.views}
              </span>
              <span className="text-xs font-semibold text-authGreen-600">
                Views
              </span>
            </div>
            <div className="flex items-center gap-1 rounded-lg bg-white/90 px-1">
              <span className="text-xs font-semibold text-red-500">
                {chapter._count.likes}
              </span>
              <span className="text-xs font-semibold text-red-500">Likes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChapterPurchased;
