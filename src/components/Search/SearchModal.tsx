import { Dialog } from "@headlessui/react";
import useSearch from "@hooks/search";
import { api } from "@utils/api";
import { useRouter } from "next/router";
import { useState } from "react";
import { HiOutlineMagnifyingGlass, HiOutlineXMark } from "react-icons/hi2";
import SearchBookResult from "./SearchBookResult";
import SearchChapterResult from "./SearchChapterResult";
import SearchUserResult from "./SearchUserResult";

const allCategory = ["Users", "Books", "Chapters"] as const;

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
  const router = useRouter();
  const { searchTerm, enableSearch, searchTermChangeHandler } = useSearch();
  const [selectedCategory, setSelectedCategory] =
    useState<SearchCategory>("Users");
  const { data: users } = api.search.searchUsers.useInfiniteQuery(
    {
      search: searchTerm,
      limit: 3,
    },
    {
      enabled: openDialog && selectedCategory === "Users" && enableSearch,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
  const { data: books } = api.search.searchBooks.useInfiniteQuery(
    {
      search: {
        title: searchTerm,
        description: searchTerm,
      },
      limit: 3,
    },
    {
      enabled: openDialog && selectedCategory === "Books" && enableSearch,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
  const { data: chapters } = api.search.searchChapters.useInfiniteQuery(
    {
      search: searchTerm,
      limit: 3,
    },
    {
      enabled: openDialog && selectedCategory === "Chapters" && enableSearch,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const redirectUserHandler = (penname: string) => () => {
    void router.push(`/${penname}`);
    onCloseDialog();
  };
  const redirectBookHandler = (penname: string, bookId: string) => () => {
    void router.push(`/${penname}/book/${bookId}`);
    onCloseDialog();
  };
  const redirectChapterHandler = (chapterId: string) => () => {
    void router.push(`/chapter/${chapterId}`);
    onCloseDialog();
  };

  // TODO: handle loading, empty and error state
  const searchResults = (category: SearchCategory) => {
    switch (category) {
      case "Users":
        return users?.pages
          .flatMap((page) => page.items)
          .map((user) => (
            <SearchUserResult
              key={user.id}
              user={user}
              onClickCard={redirectUserHandler(user.penname as string)}
            />
          ));
      case "Books":
        return books?.pages
          .flatMap((page) => page.items)
          .map((book) => (
            <SearchBookResult
              key={book.id}
              book={book}
              onClickCard={redirectBookHandler(
                book.owners[0]?.user.penname as string,
                book.id
              )}
            />
          ));
      case "Chapters":
        return chapters?.pages
          .flatMap((page) => page.items)
          .map((chapter) => (
            <SearchChapterResult
              key={chapter.id}
              chapter={chapter}
              onClickCard={redirectChapterHandler(chapter.id)}
            />
          ));
    }
  };

  return (
    <Dialog open={openDialog} onClose={onCloseDialog}>
      <div className="fixed inset-0 z-50 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 z-50 flex items-start justify-center p-4">
        <Dialog.Panel className="flex max-h-full w-1/3 flex-col overflow-y-auto rounded-lg border-0 bg-white p-8 shadow-lg outline-none focus:outline-none">
          <div className="mb-5 flex items-center justify-between text-gray-800">
            <Dialog.Title className="text-2xl font-semibold ">
              Search
            </Dialog.Title>
            <button type="button" onClick={onCloseDialog}>
              <HiOutlineXMark className="h-6 w-6 stroke-[3]" />
            </button>
          </div>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <HiOutlineMagnifyingGlass className="h-6 w-6 stroke-dark-400" />
            </span>
            <input
              className="block w-96 rounded border p-2 pl-10 text-sm text-gray-900  focus:outline-none"
              id="search"
              type="text"
              value={searchTerm}
              onChange={searchTermChangeHandler}
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
