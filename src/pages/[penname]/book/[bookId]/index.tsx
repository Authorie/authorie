import { useRouter } from "next/router";

import BookContent from "~/components/Book/BookContent";
import { api } from "~/utils/api";

export default function BookPage() {
  const router = useRouter();
  const bookId = router.query.bookId as string;
  const penname = router.query.penname as string;
  const { data: categories } = api.category.getAll.useQuery(undefined);
  const { data: book, isFetched: isBookFetched } = api.book.getData.useQuery(
    {
      id: bookId,
    },
    {
      enabled: router.isReady,
    }
  );
  const { data: collaborators } = api.user.getBookCollaborators.useQuery(
    {
      bookId: bookId,
    },
    {
      enabled: router.isReady,
    }
  );
  const { data: isFavorite } = api.book.isFavorite.useQuery(
    { id: bookId },
    {
      enabled: router.isReady,
    }
  );

  if (isBookFetched && !book) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <h2 className="text-3xl font-bold">Book not found</h2>
        <p className="text-lg font-light">Please check the url</p>
      </div>
    );
  }

  return (
    <div className="w-full px-6 py-8">
      {book && categories && collaborators && isFavorite !== undefined ? (
        <BookContent
          penname={penname}
          book={book}
          categories={categories}
          collaborators={collaborators}
          isFavorite={isFavorite}
        />
      ) : (
        <div className="grid h-[788px] w-full items-center justify-center rounded-xl bg-white shadow-lg">
          <svg
            className="h-8 w-auto animate-spin text-gray-900"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
