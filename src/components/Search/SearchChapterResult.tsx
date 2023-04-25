import dayjs from "dayjs";
import Link from "next/link";
import { HiEye, HiHeart } from "react-icons/hi2";

import type { RouterOutputs } from "~/utils/api";
import SearchResultCard from "./SearchResultCard";

type props = {
  onClick: () => void;
  chapter: RouterOutputs["search"]["searchChapters"]["items"][number];
};

const SearchChapterResult = ({ onClick, chapter }: props) => {
  return (
    <SearchResultCard onClick={onClick}>
      <Link
        href={`/chapters/${chapter.id}`}
        className="mr-2 w-10/12 py-3 pr-10"
      >
        <p className="text-xs text-authBlue-500">CHAPTER</p>
        <h4 className="text-xl font-bold text-authBlue-500">{chapter.title}</h4>
        <div className="my-2 flex gap-10 text-xs text-dark-400">
          <p>publish : {dayjs(chapter.publishedAt).format("DD/MM/YYYY")}</p>
          <p>author : {chapter.owner.penname!}</p>
          {chapter.book && <p>book : {chapter.book?.title}</p>}
        </div>
        <div className="flex gap-5">
          <div className="flex items-center gap-1 text-red-400">
            <HiHeart className="h-3 w-3" />
            <p className="text-xs font-semibold">{chapter._count.likes}</p>
          </div>
          <div className="flex items-center gap-1 text-authGreen-600">
            <HiEye className="h-3 w-3" />
            <p className="text-xs font-semibold">{chapter._count.views}</p>
          </div>
        </div>
      </Link>
    </SearchResultCard>
  );
};

export default SearchChapterResult;
