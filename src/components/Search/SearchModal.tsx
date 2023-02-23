import SearchUserResult from "./SearchUserResult";
import SearchBookResult from "./SearchBookResult";
import SearchChapterResult from "./SearchChapterResult";
import { Dialog } from "@headlessui/react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { api } from "@utils/api";
import { userInfo, bookInfo, chapterInfo, allTab } from "mocks/search";
import type { ChangeEvent } from "react";

type props = {
  onCloseDialog: () => void;
  openDialog: boolean;
};

const SearchModal = ({ onCloseDialog, openDialog }: props) => {
  const [searchInput, setSearchInput] = useState("");
  const [tab, setTab] = useState<string>("Users");
  //api
  // const { data: searchResults } = api.search.search.useQuery({
  //   search: searchInput,
  // });
  const onClickTabHandler = (selectedTab: string) => {
    setTab(selectedTab);
  };

  const className = (selectedTab: string) => {
    if (selectedTab === tab) {
      return "bg-slate-800 px-5 py-1 text-xs font-semibold text-white rounded-full";
    } else {
      return "bg-slate-400 px-5 text-xs text-white rounded-full";
    }
  };

  const onChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setSearchInput(event.target.value);
  };

  return (
    <>
      <Dialog open={openDialog} onClose={onCloseDialog}>
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-start justify-center p-4">
          <Dialog.Panel className="flex max-h-full w-[800px] flex-col overflow-y-scroll rounded-lg border-0 bg-white p-8 shadow-lg outline-none focus:outline-none">
            <div className="mb-5 flex items-start justify-between">
              <Dialog.Title className="text-xl font-semibold">
                Search
              </Dialog.Title>
              <button
                className="text-xl font-semibold text-black"
                onClick={onCloseDialog}
              >
                X
              </button>
            </div>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlassIcon className="h-6 w-6 stroke-dark-400" />
              </span>
              <input
                className="block w-96 rounded border p-2 pl-10 text-sm text-white focus:bg-white focus:text-gray-900 focus:outline-none"
                id="search"
                type="text"
                onChange={onChangeHandler}
                placeholder="Enter pen name, book title, chapter title..."
              />
            </div>
            <div className="my-4 flex gap-2 rounded">
              {allTab.map((selectedTab) => (
                <button
                  key={selectedTab}
                  onClick={() => onClickTabHandler(selectedTab)}
                  className={className(selectedTab)}
                >
                  {selectedTab}
                </button>
              ))}
            </div>
            {(tab === "All" || tab === "Users") &&
              userInfo.map((userInfo) => (
                <SearchUserResult
                  key={userInfo.userId}
                  penname={userInfo.penname}
                  reads={userInfo.reads}
                  followers={userInfo.followers}
                  following={userInfo.following}
                  bio={userInfo.bio}
                />
              ))}
            {(tab === "Books" || tab === "All") &&
              bookInfo.map((bookInfo) => (
                <SearchBookResult
                  key={bookInfo.bookId}
                  title={bookInfo.title}
                  date={bookInfo.date}
                  author={bookInfo.author}
                  description={bookInfo.description}
                />
              ))}
            {(tab === "Chapters" || tab === "All") &&
              chapterInfo.map((chapterInfo) => (
                <SearchChapterResult
                  key={chapterInfo.chapterId}
                  title={chapterInfo.title}
                  date={chapterInfo.date}
                  author={chapterInfo.author}
                  book={chapterInfo.book}
                  content={chapterInfo.content}
                />
              ))}
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
};

export default SearchModal;
