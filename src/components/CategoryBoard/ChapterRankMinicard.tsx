import { useRouter } from "next/router";
import { HiEye } from "react-icons/hi2";

type props = {
  id: string;
  rank: number;
  title: string;
  penname: string;
  views: number;
};

const ChapterRankMinicard = ({ id, rank, title, penname, views }: props) => {
  const router = useRouter();
  return (
    <div
      onClick={() => void router.push(`/chapter/${id}`)}
      className="flex w-56 cursor-pointer gap-1 rounded-lg px-2 py-1 text-white hover:bg-dark-500"
    >
      <h1 className="font-semibold">{rank}.</h1>
      <div className="mt-0.5 flex w-full flex-col gap-1">
        <h1 className="text-sm font-semibold">{title}</h1>
        <p className="text-xs font-light">By {penname}</p>
      </div>
      <div className="flex w-fit items-center gap-1 rounded-lg bg-gray-700 px-2 shadow-lg">
        <HiEye className="h-3 w-3 text-white" />
        <p className="text-xs text-white">{views}</p>
      </div>
    </div>
  );
};

export default ChapterRankMinicard;
