import type { RouterOutputs } from "~/utils/api";
import { useRouter } from "next/router";
import { HiEye, HiHeart, HiPencil } from "react-icons/hi2";
import type { MouseEvent } from "react";

type props = {
  chapter: RouterOutputs["book"]["getData"]["chapters"][number];
};

const ChapterCard = ({ chapter }: props) => {
  const router = useRouter();
  const onEditHandler = (e: MouseEvent) => {
    e.stopPropagation();
    void router.push("/create/chapter");
  };
  return (
    <div
      onClick={() => void router.push(`/chapter/${chapter.id}`)}
      className="flex h-16 w-full cursor-pointer items-center justify-between rounded-lg bg-white px-3 shadow-lg transition duration-100 ease-in-out hover:-translate-y-1 hover:scale-[1.01]"
    >
      <h1 className="mr-3 w-20 text-3xl font-bold text-authGreen-600"># 1</h1>
      <div className="flex w-full flex-col gap-1">
        <h2 className="line-clamp-1 text-lg font-semibold">{chapter.title}</h2>
        {chapter.publishedAt &&
          (chapter.publishedAt > new Date() ? (
            <p className="text-xs font-semibold text-green-500">
              publish soon on: {chapter.publishedAt.toLocaleDateString()}
              {", "}
              {chapter.publishedAt.toLocaleTimeString()}
            </p>
          ) : (
            <p className="text-xs font-extralight">{`Last update : ${chapter.publishedAt.toLocaleDateString()}`}</p>
          ))}
      </div>
      <div className="flex h-full flex-col items-end justify-end gap-1 py-2">
        {chapter.publishedAt &&
          new Date(new Date().getTime() + 60 * 60 * 1000) <
            chapter.publishedAt && (
            <HiPencil
              onClick={onEditHandler}
              className="h-8 w-8 rounded-xl border p-1 hover:bg-gray-200"
            />
          )}
        <div className="flex gap-2">
          <div className="flex items-center gap-1 text-red-400">
            <HiHeart className="h-3 w-3" />
            <p className="text-xs font-semibold">{chapter._count.likes}</p>
          </div>
          <div className="flex items-center gap-1 text-authGreen-600">
            <HiEye className="h-3 w-3" />
            <p className="text-xs font-semibold">{chapter._count.views}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChapterCard;
