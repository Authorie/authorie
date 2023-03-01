import Book from "@components/Book/Book";
import { Bars3CenterLeftIcon } from "@heroicons/react/24/outline";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/router";
import { api } from "@utils/api";

const BookPage = () => {
  const router = useRouter();
  const { penname } = router.query;

  const { data: books } = api.book.getAll.useQuery({ penname: "four58" });

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
                id={data.id}
                title={data.title}
                description={data.description}
                like={100}
                read={100}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default BookPage;
