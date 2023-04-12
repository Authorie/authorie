import { BookOwnerStatus, BookStatus } from "@prisma/client";
import Link from "next/link";
import { useMemo } from "react";
import type { RouterOutputs } from "~/utils/api";
import Book from "./Book";

type props = {
  books: RouterOutputs["book"]["getAll"];
  penname: string;
  isOwner: boolean;
  isArchived: boolean;
};

const BookList = ({ books, penname, isOwner, isArchived }: props) => {
  const filteredBooks = useMemo(() => {
    if (!isOwner) {
      return books.filter(
        (book) =>
          book.status === BookStatus.PUBLISHED ||
          book.status === BookStatus.COMPLETED
      );
    }
    return books.filter((book) => !book.isRejected);
  }, [books, isOwner]);

  if (books.length === 0 && isOwner && !isArchived) {
    return (
      <div className="flex flex-col items-center gap-4">
        <p>You still don&apos;t have any book yet. Wanna create one?</p>
        <Link
          href="/create/book"
          className="rounded-lg bg-green-600 px-3 py-2 text-white hover:bg-green-700"
        >
          Create book now!
        </Link>
      </div>
    );
  }

  if (books.length == 0 && !isOwner && !isArchived) {
    return (
      <div>
        <p>{`${penname} still has not published any book yet!`}</p>
      </div>
    );
  }

  if (books.length === 0 && isArchived) {
    return (
      <div className="flex items-center justify-center text-xl font-bold">
        <p>No book being archived</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-x-8 gap-y-6">
      {filteredBooks.map((book) => (
        <Book
          key={book.id}
          id={book.id}
          title={book.title}
          ownerPenname={
            book.owners.find((data) => data.status === BookOwnerStatus.OWNER)
              ?.user.penname as string
          }
          coverImage={book.coverImage}
          description={book.description}
          isOwner={book.isOwner}
          isCollaborator={book.isCollborator}
          isInvitee={book.isInvited}
          status={book.status}
          previousStatus={book.previousStatus}
          like={book.chapters.reduce((acc, curr) => acc + curr._count.likes, 0)}
          read={book.chapters.reduce((acc, curr) => acc + curr._count.views, 0)}
        />
      ))}
    </div>
  );
};

export default BookList;
