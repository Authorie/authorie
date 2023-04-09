import { HiDocument } from "react-icons/hi2";
import type { RouterOutputs } from "~/utils/api";
import SearchResultCard from "./SearchResultCard";

type props = {
  chapter: RouterOutputs["search"]["searchChapters"]["items"][number];
  onClickCard: () => void;
};

const SearchChapterResult = ({ chapter, onClickCard }: props) => {
  return (
    <SearchResultCard onClick={onClickCard}>
      <div className="flex w-2/12 items-center justify-center rounded-l bg-authBlue-500">
        <HiDocument className="h-12 w-12 fill-white" />
      </div>
      <div className="mr-2 w-10/12 py-3 pr-10">
        <p className="text-xs font-semibold text-authBlue-500">CHAPTER</p>
        <h4 className="text-2xl font-bold text-authBlue-500">
          {chapter.title}
        </h4>
        <div className="flex gap-10 text-xs text-dark-400">
          <p>{`publish : ${
            chapter.publishedAt?.toLocaleDateString() || ""
          }`}</p>
          <p>{`author : ${chapter.owner.penname as string}`}</p>
          <p>{`book : ${chapter.book?.title as string}`}</p>
        </div>
      </div>
    </SearchResultCard>
  );
};

export default SearchChapterResult;
