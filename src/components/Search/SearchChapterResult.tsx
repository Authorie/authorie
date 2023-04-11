import { HiHeart, HiEye } from "react-icons/hi2";
import type { RouterOutputs } from "~/utils/api";
import SearchResultCard from "./SearchResultCard";

type props = {
  chapter: RouterOutputs["search"]["searchChapters"]["items"][number];
  onClickCard: () => void;
};

const SearchChapterResult = ({ chapter, onClickCard }: props) => {
  return (
    <SearchResultCard onClick={onClickCard}>
      <div className="mr-2 w-10/12 py-3 pr-10">
        <p className="text-xs text-authBlue-500">CHAPTER</p>
        <h4 className="text-xl font-bold text-authBlue-500">{chapter.title}</h4>
        <div className="my-2 flex gap-10 text-xs text-dark-400">
          <p>{`publish : ${
            chapter.publishedAt?.toLocaleDateString() || ""
          }`}</p>
          <p>{`author : ${chapter.owner.penname as string}`}</p>
          <p>{`book : ${chapter.book?.title as string}`}</p>
        </div>
        <div className="flex gap-5">
          <div className="flex items-center gap-1 text-red-400">
            <HiHeart className="h-3 w-3" />
            <p className="text-xs font-semibold">Like</p>
          </div>
          <div className="flex items-center gap-1 text-authGreen-600">
            <HiEye className="h-3 w-3" />
            <p className="text-xs font-semibold">View</p>
          </div>
        </div>
      </div>
    </SearchResultCard>
  );
};

export default SearchChapterResult;
