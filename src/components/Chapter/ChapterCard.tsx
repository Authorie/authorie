import { EyeIcon, HeartIcon, PencilIcon } from "@heroicons/react/24/solid";
import type { RouterOutputs } from "@utils/api";
import { useRouter } from "next/router";

type props = {
  chapter: RouterOutputs["book"]["getData"]["chapters"][number];
};

const ChapterCard = ({ chapter }: props) => {
  const router = useRouter();
  return (
    <div
      onClick={() => void router.push(`/chapter/${chapter.id}`)}
      className="flex h-16 w-full cursor-pointer items-center justify-between rounded-lg bg-white p-3 shadow-lg transition duration-100 ease-in-out hover:-translate-y-1 hover:scale-[1.01] hover:bg-gray-300"
    >
      <h1 className="mr-4 text-3xl font-bold text-authGreen-600">#1</h1>
      <div className="flex grow flex-col gap-1">
        <div className="flex items-center justify-between">
          <h2 className="w-64 text-lg font-semibold line-clamp-1">
            {chapter.title}
          </h2>
          <PencilIcon className="h-8 w-8 rounded-xl border p-2" />
        </div>
        <div className="flex justify-between">
          {chapter.publishedAt && (
            <p className="text-xs font-extralight">{`Last update : ${chapter.publishedAt.toLocaleDateString()}`}</p>
          )}
          <div className="flex gap-2">
            <div className="flex items-center gap-1 text-red-400">
              <HeartIcon className="h-3 w-3" />
              <p className="text-xs font-semibold">{chapter._count.likes}</p>
            </div>
            <div className="flex items-center gap-1 text-authGreen-600">
              <EyeIcon className="h-3 w-3" />
              <p className="text-xs font-semibold">{chapter.views}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChapterCard;
