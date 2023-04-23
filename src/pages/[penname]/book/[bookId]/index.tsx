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
    <div className="w-full px-6">
      {book && categories && collaborators && isFavorite !== undefined && (
        <BookContent
          penname={penname}
          book={book}
          categories={categories}
          collaborators={collaborators}
          isFavorite={isFavorite}
        />
      )}
    </div>
  );
}
