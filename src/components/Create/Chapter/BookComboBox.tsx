import { Fragment, useState } from "react";
import { Combobox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";

type Book = {
  id: string;
  name: string;
};

const books: Book[] = [
  { id: "1", name: "Wade Cooper" },
  { id: "2", name: "Arlene Mccoy" },
  { id: "3", name: "Devon Webb" },
  { id: "4", name: "Tom Cook" },
  { id: "5", name: "Tanya Fox" },
  { id: "6", name: "Hellen Schmidt" },
  { id: "7", name: "Devon Webb" },
  { id: "8", name: "Tom Cook" },
  { id: "9", name: "Tanya Fox" },
  { id: "10", name: "Hellen Schmidt" },
];

const BookComboBox = () => {
  const [selected, setSelected] = useState(books[0]);
  const [query, setQuery] = useState("");

  const filteredBook =
    query === ""
      ? books
      : books.filter((book) =>
          book.name
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(query.toLowerCase().replace(/\s+/g, ""))
        );

  return (
    <Combobox value={selected} onChange={setSelected}>
      <div className="relative">
        <div className="flex w-full items-center overflow-hidden rounded-lg shadow-md outline outline-gray-600">
          <Combobox.Input
            className="w-full border-none bg-transparent pl-3 pr-10 text-xs leading-5 text-gray-900 focus:outline-none"
            displayValue={(book: Book) => book.name}
            onChange={(event) => setQuery(event.target.value)}
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
          afterLeave={() => setQuery("")}
        >
          <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {filteredBook.length === 0 && query !== "" ? (
              <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                Nothing found.
              </div>
            ) : (
              filteredBook.map((book) => (
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
                        {book.name}
                      </span>
                      {selected ? (
                        <span
                          className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                            active ? "text-white" : "text-teal-600"
                          }`}
                        >
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </Transition>
      </div>
    </Combobox>
  );
};

export default BookComboBox;
