import { Dialog } from "@headlessui/react";
import { useRouter } from "next/router";
import { useState } from "react";
import { HiOutlineMagnifyingGlass, HiOutlineXMark } from "react-icons/hi2";
import useInfiniteScrollDialog from "~/hooks/infiniteScrollDialog";
import useSearch from "~/hooks/search";
import { api } from "~/utils/api";
import SearchBookResult from "./SearchBookResult";
import SearchChapterResult from "./SearchChapterResult";
import BookResultSkeleton from "./SearchSkeleton/BookResultSkeleton";
import ChapterResultSkeleton from "./SearchSkeleton/ChapterResultSkeleton";
import UserResultSkeleton from "./SearchSkeleton/UserResultSkeleton";
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
  const {
    data: users,
    fetchNextPage: fetchUserNextPage,
    isFetchingNextPage: isFetchingUserNextPage,
    hasNextPage: hasUserNextPage,
    isLoading: isLoadingUser,
  } = api.search.searchUsers.useInfiniteQuery(
    {
      search: searchTerm,
      limit: 3,
    },
    {
      enabled: openDialog && selectedCategory === "Users" && enableSearch,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
  const {
    data: books,
    fetchNextPage: fetchBookNextPage,
    isFetchingNextPage: isFetchingBookNextPage,
    hasNextPage: hasBookNextPage,
    isLoading: isLoadingBook,
  } = api.search.searchBooks.useInfiniteQuery(
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
  const {
    data: chapters,
    fetchNextPage: fetchChapterNextPage,
    isFetchingNextPage: isFetchingChapterNextPage,
    hasNextPage: hasChapterNextPage,
    isLoading: isLoadingChapter,
  } = api.search.searchChapters.useInfiniteQuery(
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
  useInfiniteScrollDialog({
    fetchNextPage: fetchUserNextPage,
    hasNextPage: hasUserNextPage,
    scrollableId: selectedCategory === "Users" ? selectedCategory : null,
  });
  useInfiniteScrollDialog({
    fetchNextPage: fetchBookNextPage,
    hasNextPage: hasBookNextPage,
    scrollableId: selectedCategory === "Books" ? selectedCategory : null,
  });
  useInfiniteScrollDialog({
    fetchNextPage: fetchChapterNextPage,
    hasNextPage: hasChapterNextPage,
    scrollableId: selectedCategory === "Chapters" ? selectedCategory : null,
  });

  return (
    <Dialog open={openDialog} onClose={onCloseDialog}>
      <div className="fixed inset-0 z-50 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 z-50 mt-8 flex items-start justify-center">
        <Dialog.Panel className="flex max-h-full w-3/5 max-w-2xl flex-col rounded-lg border-0 bg-white pt-8 shadow-lg outline-none focus:outline-none">
          <div className="mx-8 mb-5 flex items-center justify-between text-gray-800">
            <Dialog.Title className="text-2xl font-semibold ">
              Search
            </Dialog.Title>
            <button type="button" onClick={onCloseDialog}>
              <HiOutlineXMark className="h-6 w-6 stroke-[3]" />
            </button>
          </div>
          <div className="relative mx-8 w-fit">
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
          <div className="mx-8 my-4 flex gap-2 rounded">
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
          <hr className="mx-8 my-1 h-px border-t-0 bg-gray-200"></hr>
          <div
            id={selectedCategory}
            className="grid-flow-rol grid h-96 gap-3 overflow-y-scroll px-8 pb-6 pt-3 "
          >
            {searchResults(selectedCategory)}
            {(isFetchingUserNextPage || isLoadingUser) && (
              <UserResultSkeleton />
            )}
            {(isFetchingBookNextPage || isLoadingBook) && (
              <BookResultSkeleton />
            )}
            {(isFetchingChapterNextPage || isLoadingChapter) && (
              <ChapterResultSkeleton />
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default SearchModal;
