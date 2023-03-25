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
      className="flex h-16 w-96 cursor-pointer items-center justify-between rounded-lg bg-white p-3 shadow-lg transition duration-100 ease-in-out hover:-translate-y-1 hover:scale-[1.01]"
    >
      <h1 className="text-3xl font-bold text-authGreen-600"># 1</h1>
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">{chapter.title}</h2>
        {chapter.publishedAt && (
          <p className="text-xs font-extralight">{`Last update : ${chapter.publishedAt.toLocaleDateString()}`}</p>
        )}
      </div>
      <div className="flex flex-col items-end gap-1">
        <PencilIcon className="h-8 w-8 rounded-xl border p-2" />
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
  );
};

export default ChapterCard;
