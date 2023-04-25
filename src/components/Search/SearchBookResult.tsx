import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";
import type { RouterOutputs } from "~/utils/api";
import SearchResultCard from "./SearchResultCard";
import { BookOwnerStatus } from "@prisma/client";

type props = {
  book: RouterOutputs["search"]["searchBooks"]["items"][number];
  onClick: () => void;
};

const SearchBookResult = ({ book, onClick }: props) => {
  const ownerPenname = book.owners.find(
    ({ status }) => status === BookOwnerStatus.OWNER
  )!.user.penname!;

  return (
    <SearchResultCard onClick={onClick}>
      <Link className="flex grow" href={`/${ownerPenname}/book/${book.id}`}>
        <div className="grow py-3">
          <p className="text-xs text-authGreen-600">BOOK</p>
          <h4 className="text-xl font-bold text-authGreen-600">{book.title}</h4>
          <div className="my-2 flex gap-14 text-xs text-dark-400">
            <p>
              published :{" "}
              <span>{dayjs(book.createdAt).format("DD/MM/YYYY")}</span>
            </p>
            <p>
              author :{" "}
              <span className="font-semibold text-dark-500">
                {ownerPenname}
              </span>
            </p>
          </div>
          <p className="mt-2 line-clamp-2 text-xs text-dark-600">
            {book.description || ""}
          </p>
        </div>
        <div className="flex h-full items-center justify-center py-2">
          <div className="h-full w-2 bg-authGreen-500" />
          <div className="flex h-28 w-20 items-center justify-center overflow-hidden">
            {book.coverImage ? (
              <Image
                src={book.coverImage}
                width={170}
                height={220}
                alt="book cover image"
              />
            ) : (
              <div className="h-full w-full bg-authGreen-400" />
            )}
          </div>
        </div>
      </Link>
    </SearchResultCard>
  );
};

export default SearchBookResult;
