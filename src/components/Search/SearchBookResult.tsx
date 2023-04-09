import Image from "next/image";
import { HiBookOpen } from "react-icons/hi2";
import type { RouterOutputs } from "~/utils/api";
import SearchResultCard from "./SearchResultCard";

type props = {
  book: RouterOutputs["search"]["searchBooks"]["items"][number];
  onClickCard: () => void;
};

const SearchBookResult = ({ book, onClickCard }: props) => {
  return (
    <SearchResultCard onClick={onClickCard}>
      <div className="flex w-2/12 items-center justify-center rounded-l bg-authGreen-500">
        <HiBookOpen className="h-12 w-12 fill-white" />
      </div>
      <div className="grow py-3">
        <p className="text-xs font-semibold text-authGreen-500">BOOK</p>
        <h4 className="text-2xl font-bold text-authGreen-500">{book.title}</h4>
        <div className="flex gap-24 text-xs text-dark-400">
          <p>{`publish : ${book.createdAt.toLocaleDateString()}`}</p>
          <p>{`author : ${book.owners[0]?.user.penname as string}`}</p>
        </div>
        <p className="mt-4 line-clamp-2 text-xs text-dark-600">
          {book.description || ""}
        </p>
      </div>
      <div className="flex w-2/12 items-center justify-center">
        <div className="overflow-hidden border border-gray-200">
          <Image
            src="/placeholder_book_cover.png"
            width={100}
            height={100}
            alt="book cover image"
          />
        </div>
      </div>
    </SearchResultCard>
  );
};

export default SearchBookResult;
