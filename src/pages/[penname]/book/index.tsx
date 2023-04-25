import { BookStatus } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import { HiOutlineArchiveBox, HiOutlineArrowUturnLeft } from "react-icons/hi2";
import BookList from "~/components/Book/BookList";
import BookSkeleton from "~/components/Book/BookSkeleton";
import BookStateInformation from "~/components/Information/BookStateInformation";
import InformationButton from "~/components/Information/InformationButton";
import { api, type RouterOutputs } from "~/utils/api";

const BookPage = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const penname = router.query.penname as string;
  const [openArchive, setOpenArchive] = useState(false);
  const [openInformation, setOpenInformation] = useState(false);
  const { data: user } = api.user.getData.useQuery(penname);
  const { data: bookIds, isLoading: bookIdsLoading } = api.book.getAll.useQuery(
    { penname }
  );
  const isOwner = session ? user?.id === session.user.id : false;
  const books = api.useQueries(
    (t) => bookIds?.map((bookId) => t.book.getData(bookId)) ?? []
  );
  const booksLoading = books.some((book) => book.isLoading);
  const [archiveBooks, nonarchiveBooks] = booksLoading
    ? [undefined, undefined]
    : books.reduce(
        (acc, { data: book }) => {
          acc[book!.status === BookStatus.ARCHIVED ? 0 : 1]!.push(book!);
          return acc;
        },
        [
          [] as RouterOutputs["book"]["getData"][],
          [] as RouterOutputs["book"]["getData"][],
        ]
      );

  return (
    <div className="mb-8 mt-6 w-[1024px]">
      <div className={"max-h-full rounded-lg p-4 px-6 shadow-lg"}>
        <div className="flex items-center justify-between">
          {isOwner && (
            <>
              {!openArchive ? (
                <div
                  onClick={() => setOpenArchive(true)}
                  className="mb-3 flex cursor-pointer items-center justify-center gap-2 rounded-full bg-gray-400 px-4 py-1 text-sm font-semibold text-white hover:bg-gray-500"
                >
                  <HiOutlineArchiveBox className="h-5 w-5" />
                  <p>View Archived</p>
                </div>
              ) : (
                <div
                  onClick={() => setOpenArchive(false)}
                  className="mb-3 flex cursor-pointer items-center justify-center gap-2 rounded-full bg-authGreen-400 px-4 py-1 text-sm font-semibold text-white hover:bg-authGreen-500"
                >
                  <HiOutlineArrowUturnLeft className="h-5 w-5" />
                  <p>View Book Shelf</p>
                </div>
              )}
              <InformationButton
                openModal={() => setOpenInformation(true)}
                isOpen={openInformation}
                closeModal={() => setOpenInformation(false)}
                title={"Book State"}
                color="gray-400"
                hoverColor="gray-200"
              >
                <BookStateInformation />
              </InformationButton>
            </>
          )}
        </div>
        {user && archiveBooks && nonarchiveBooks && (
          <BookList
            penname={penname}
            isOwner={isOwner}
            isArchived={openArchive}
            books={openArchive ? archiveBooks : nonarchiveBooks}
          />
        )}
        {bookIdsLoading ||
          (booksLoading && (
            <div className="grid grid-cols-4 gap-x-8 gap-y-6">
              <BookSkeleton />
              <BookSkeleton />
              <BookSkeleton />
              <BookSkeleton />
            </div>
          ))}
      </div>
      {openArchive && (
        <p className="mt-4 text-sm text-gray-600">
          Note: Unarchive to make the book viewable again
        </p>
      )}
      {isOwner && !openArchive && (
        <p className="mt-4 text-sm text-gray-600">
          Note: Do not forget to publish your book so people can read it
        </p>
      )}
    </div>
  );
};

export default BookPage;
