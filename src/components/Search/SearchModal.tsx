import { env } from "@env/client.mjs";
import { Dialog } from "@headlessui/react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { api } from "@utils/api";
import { useEffect, useState } from "react";
import SearchBookResult from "./SearchBookResult";
import SearchUserResult from "./SearchUserResult";

const allCategory = ["Users", "Books"] as const;

type SearchCategory = (typeof allCategory)[number];

type props = {
  openDialog: boolean;
  onCloseDialog: () => void;
};

const categoryButtonClassName = (
  category: SearchCategory,
  selectedCategory: SearchCategory
) => {
  if (category === selectedCategory) {
    return "bg-slate-800 px-5 py-1 text-xs font-semibold text-white rounded-full";
  } else {
    return "bg-slate-400 px-5 text-xs text-white rounded-full";
  }
};

const SearchModal = ({ onCloseDialog, openDialog }: props) => {
  const [enableSearch, setEnableSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<SearchCategory>("Users");
  const { data: users } = api.search.searchUsers.useQuery(
    {
      search: searchTerm,
    },
    {
      enabled: openDialog && selectedCategory === "Users" && enableSearch,
    }
  );
  const { data: books } = api.search.searchBooks.useQuery(
    {
      search: searchTerm,
    },
    {
      enabled: openDialog && selectedCategory === "Books" && enableSearch,
    }
  );

  useEffect(() => {
    setEnableSearch(false);
    const delayDebounceFn = setTimeout(() => {
      setEnableSearch(true);
    }, env.NEXT_PUBLIC_BOUNCE_DELAY_MILLISECONDS);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // TODO: handle loading, empty and error state
  const searchResults = (category: SearchCategory) => {
    switch (category) {
      case "Users":
        return users?.map((user) => (
          <SearchUserResult key={user.id} user={user} />
        ));
      case "Books":
        return books?.map((book) => (
          <SearchBookResult key={book.id} book={book} />
        ));
    }
  };

  return (
    <Dialog open={openDialog} onClose={onCloseDialog}>
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 z-50 flex items-start justify-center p-4">
        <Dialog.Panel className="flex max-h-full w-1/3 flex-col overflow-y-auto rounded-lg border-0 bg-white p-8 shadow-lg outline-none focus:outline-none">
          <div className="mb-5 flex items-center justify-between text-gray-800">
            <Dialog.Title className="text-2xl font-semibold ">
              Search
            </Dialog.Title>
            <button type="button" onClick={onCloseDialog}>
              <XMarkIcon className="h-6 w-6 stroke-[3]" />
            </button>
          </div>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-6 w-6 stroke-dark-400" />
            </span>
            <input
              className="block w-96 rounded border p-2 pl-10 text-sm text-gray-900  focus:outline-none"
              id="search"
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Enter pen name, book title, chapter title..."
            />
          </div>
          <div className="my-4 flex gap-2 rounded">
            {allCategory.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={categoryButtonClassName(category, selectedCategory)}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="grid-flow-rol grid max-h-full gap-3">
            {searchResults(selectedCategory)}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default SearchModal;
