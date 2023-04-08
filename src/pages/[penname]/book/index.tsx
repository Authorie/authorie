import { BookStatus } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import { HiOutlineArchiveBox, HiOutlineArrowUturnLeft } from "react-icons/hi2";
import BookList from "~/components/Book/BookList";
import BookLoading from "~/components/Book/BookLoading";
import { api } from "~/utils/api";

const BookPage = () => {
  const router = useRouter();
  const penname = router.query.penname as string;
  const { data: session } = useSession();
  const [openArchive, setOpenArchive] = useState(false);
  const { data: user } = api.user.getData.useQuery(penname);
  const { data: books, isLoading: bookIsLoading } = api.book.getAll.useQuery(
    {
      penname,
    },
    { enabled: penname !== undefined }
  );
  const archiveBooks = books?.filter(
    (book) => book.status === BookStatus.ARCHIVED
  );
  const nonarchiveBooks = books?.filter(
    (book) => book.status !== BookStatus.ARCHIVED
  );
  const isOwner = user?.id === session?.user.id;
  return (
    <div className="mb-8 mt-6 w-[1024px]">
      <div className={"max-h-full rounded-lg p-4 px-6 shadow-lg"}>
        <div className="flex items-center justify-start">
          {isOwner &&
            (!openArchive ? (
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
            ))}
        </div>
        {user && books && archiveBooks && nonarchiveBooks && (
          <BookList
            books={openArchive ? archiveBooks : nonarchiveBooks}
            isOwner={user.id === session?.user.id}
            isArchived={openArchive}
            penname={penname}
          />
        )}
        {bookIsLoading && (
          <div className="grid grid-cols-4 gap-x-8 gap-y-6">
            <BookLoading />
            <BookLoading />
            <BookLoading />
            <BookLoading />
          </div>
        )}
      </div>
      {openArchive && (
        <p className="mt-4 text-sm text-gray-600">
          Noted: Unarchive to make the book viewable again
        </p>
      )}
    </div>
  );
};

export default BookPage;
