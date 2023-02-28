import Book from "@components/Book/Book";
import { bookInfo } from "mocks/search";
import { Bars3CenterLeftIcon } from "@heroicons/react/24/outline";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const BookPage = () => {
  return (
    <div className="mb-8 mt-6 min-w-[1024px]">
      <div className="max-h-full rounded-lg bg-white p-4 px-6 shadow-lg">
        <div className="mb-5 flex justify-between">
          <Bars3CenterLeftIcon className="h-7 w-7 rounded-lg bg-dark-100 text-authGreen-600" />
          <MagnifyingGlassIcon className="h-7 w-7 rounded-lg bg-dark-100 text-authGreen-600" />
        </div>
        <div className="grid grid-cols-4 gap-x-8 gap-y-6">
          {bookInfo.map((data) => (
            <Book
              key={data.bookId}
              bookId={data.bookId}
              title={data.title}
              description={data.description}
              read={data.read}
              like={data.like}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookPage;
