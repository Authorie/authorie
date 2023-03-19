import { Combobox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { BookStatus } from "@prisma/client";
import type { RouterOutputs } from "@utils/api";
import { api } from "@utils/api";
import { useSession } from "next-auth/react";
import { Fragment, useMemo, useState } from "react";

type Books = RouterOutputs["book"]["getAll"]["items"];

type props = {
  user: RouterOutputs["user"]["getData"];
  selectedBook: Books[number] | undefined;
  onSelectBook: (book: Books[number]) => void;
};

const bookFilter = (book: Books[number], query: string) => {
  const title = book.title.toLowerCase();
  const queryLower = query.toLowerCase();
  return title.includes(queryLower);
};

const bookStatusFilter = (book: Books[number]) => {
  return (
    book.status === BookStatus.DRAFT || book.status === BookStatus.PUBLISHED
  );
};

const BookComboBox = ({ user, selectedBook, onSelectBook }: props) => {
  const { status } = useSession();
  const [query, setQuery] = useState("");
  const { data: books } = api.book.getAll.useInfiniteQuery(
    { penname: user?.penname as string, limit: 10 },
    {
      enabled: status === "authenticated" && user !== undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const filteredBooks = useMemo(() => {
    return (books?.pages || [])
      .reduce((acc, page) => [...acc, ...page.items], [] as Books)
      .filter((book) => bookStatusFilter(book) && bookFilter(book, query));
  }, [books, query]);

  return (
    <Combobox value={selectedBook} onChange={onSelectBook} by="id">
      <div className="relative">
        <div className="flex w-full items-center overflow-hidden rounded-lg shadow-md outline outline-gray-600">
          <Combobox.Input
            className="w-full border-none bg-transparent pl-3 pr-10 text-xs leading-5 text-gray-900 focus:outline-none"
            onChange={(event) => setQuery(event.target.value)}
            displayValue={(book) =>
              "title" in (book as Books[number])
                ? (book as Books[number]).title
                : ""
            }
          />
          <Combobox.Button className="absolute right-0 flex">
            <ChevronUpDownIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </Combobox.Button>
        </div>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          {books && (
            <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {filteredBooks.length === 0 ? (
                <div className="relative cursor-default select-none bg-gray-200 py-2 px-4 text-gray-700">
                  No books found
                </div>
              ) : (
                filteredBooks.map((book) => (
                  <Combobox.Option
                    key={book.id}
                    className={({ active }) =>
                      `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                        active ? "bg-authGreen-600 text-white" : "text-gray-900"
                      }`
                    }
                    value={book}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={`block truncate ${
                            selected ? "font-medium" : "font-normal"
                          }`}
                        >
                          {book.title}
                        </span>
                        {selected && (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              active ? "text-white" : "text-teal-600"
                            }`}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        )}
                      </>
                    )}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          )}
        </Transition>
      </div>
    </Combobox>
  );
};

export default BookComboBox;
