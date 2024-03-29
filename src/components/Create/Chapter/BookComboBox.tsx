import { Combobox, Transition } from "@headlessui/react";
import type { Book } from "@prisma/client";
import { BookStatus } from "@prisma/client";
import { useSession } from "next-auth/react";
import { HiCheck, HiChevronUpDown } from "react-icons/hi2";
import useSearch from "~/hooks/search";
import { api, type RouterOutputs } from "~/utils/api";

type props = {
  user: RouterOutputs["user"]["getData"];
  selectedBook:
  | RouterOutputs["book"]["getData"]
  | RouterOutputs["chapter"]["getData"]["book"];
  onToggleBook: (
    book:
      | RouterOutputs["book"]["getData"]
      | RouterOutputs["chapter"]["getData"]["book"]
  ) => void;
};

const BookComboBox = ({ user, selectedBook, onToggleBook }: props) => {
  const { status } = useSession();
  const { searchTerm, enableSearch, searchTermChangeHandler } = useSearch();
  const { data: books } = api.search.searchBooks.useQuery(
    {
      search: {
        userId: user?.id,
        title: searchTerm,
        status: [BookStatus.DRAFT, BookStatus.PUBLISHED],
      },
      limit: 5,
    },
    {
      enabled: status === "authenticated" && user !== undefined && enableSearch,
    }
  );

  return (
    <Combobox value={selectedBook} onChange={onToggleBook} by="id">
      <div className="relative">
        <div className="flex w-full items-center overflow-hidden rounded-lg shadow-md">
          <Combobox.Input
            className="w-72 border-none bg-white pl-3 pr-5 text-xs leading-5 text-gray-900 focus:outline-none"
            onChange={searchTermChangeHandler}
            displayValue={(book) =>
              book
                ? "title" in (book as Book)
                  ? (book as Book).title
                  : ""
                : ""
            }
          />
          <Combobox.Button className="absolute right-0 flex">
            <HiChevronUpDown
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </Combobox.Button>
        </div>
        <Transition
          leave="transition-opacity duration-150"
          leaveFrom="opacity-0"
          leaveTo="opacity-100"
        >
          {books && (
            <Combobox.Options className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {books.items.length === 0 ? (
                <div className="relative cursor-default select-none bg-gray-200 px-4 py-2 text-gray-700">
                  No books found
                </div>
              ) : (
                books.items.map((book) => (
                  <Combobox.Option
                    key={book.id}
                    className={({ active }) =>
                      `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? "bg-authGreen-600 text-white" : "text-gray-900"
                      }`
                    }
                    value={book}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={`block truncate ${selected ? "font-medium" : "font-normal"
                            }`}
                        >
                          {book.title}
                        </span>
                        {selected && (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? "text-white" : "text-teal-600"
                              }`}
                          >
                            <HiCheck className="h-5 w-5" aria-hidden="true" />
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
