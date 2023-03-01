import Book from "@components/Book/Book";
import { bookInfo } from "mocks/search";
import { Bars3CenterLeftIcon } from "@heroicons/react/24/outline";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { api } from "@utils/api";

const BookPage = () => {
  const { data: books } = api.book.getAll.useQuery({ userId: "324" });

  return (
    <div className="mb-8 mt-6 min-w-[1024px]">
      <div className="max-h-full rounded-lg bg-white p-4 px-6 shadow-lg">
        <div className="mb-5 flex justify-between">
          <Bars3CenterLeftIcon className="h-7 w-7 rounded-lg bg-dark-100 text-authGreen-600" />
          <MagnifyingGlassIcon className="h-7 w-7 rounded-lg bg-dark-100 text-authGreen-600" />
        </div>
        <div className="grid grid-cols-4 gap-x-8 gap-y-6">
          {books &&
            books.map((data) => (
              <Book
                key={data.id}
                bookId={data.id}
                title={data.title}
                description={data.description}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default BookPage;
