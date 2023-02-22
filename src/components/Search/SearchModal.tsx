import SearchUserResult from "./SearchUserResult";
import SearchBookResult from "./SearchBookResult";
import SearchChapterResult from "./SearchChapterResult";
import { Dialog } from "@headlessui/react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

type props = {
  onDialogHandler: (open: boolean) => void;
  openDialog: boolean;
};

const SearchModal = ({ onDialogHandler, openDialog }: props) => {
  const userInfo = {
    penname: "four58",
    reads: 50,
    followers: 2400,
    following: 25,
    bio: "when the dusk approached, the delusion following by. meticulous creating the splendid night to our night time. when the dusk approached, the delusion following by. meticulous creating the splendid night to our night time.",
  };

  const bookInfo = {
    title: "A dusk delusion",
    date: new Date("2019-01-16"),
    author: "four58",
    description:
      "when the dusk approached, the delusion following by. meticulous creating the splendid night to our night time. when the dusk approached, the delusion following by. meticulous creating the splendid night to our night time.",
  };

  const chapterInfo = {
    title: "Ordinary days",
    date: new Date("2019-01-16"),
    author: "four58",
    book: "A dusk delusion",
    content:
      "when the dusk approached, the delusion following by. meticulous creating the splendid night to our night time. when the dusk approached, the delusion following by. meticulous creating the splendid night to our night time.",
  };

  const allTab = ["Users", "Books", "Chapters"];

  const [tab, setTab] = useState<string>("Users");

  const onClickTabHandler = (selectedTab: string) => {
    setTab(selectedTab);
  };

  const className = (selectedTab: string) => {
    if (selectedTab === tab) {
      return "bg-white px-10 py-1 rounded-t";
    } else {
      return "bg-authGreen-300 px-10 py-1 rounded-t";
    }
  };

  const placeHolder = () => {
    if (tab === "Users") {
      return "Enter pen name...";
    } else if (tab === "Books") {
      return "Enter book title...";
    } else {
      return "Enter chapter title...";
    }
  };

  return (
    <>
      <Dialog open={openDialog} onClose={() => onDialogHandler(false)}>
        {/* The backdrop, rendered as a fixed sibling to the panel container */}
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        {/* Full-screen container to center the panel */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          {/* The actual dialog panel */}
          <Dialog.Panel className="relative flex w-[800px] flex-col rounded-lg rounded-tl-none border-0 bg-white shadow-lg outline-none focus:outline-none">
            <div className="absolute -top-7 flex rounded">
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
            <div className="z-10 bg-white p-8">
              <div className="mb-5 flex items-start justify-between">
                <Dialog.Title className="text-xl font-semibold">{`Search for ${tab}`}</Dialog.Title>
                <button
                  className="text-xl font-semibold text-black"
                  onClick={() => onDialogHandler(false)}
                >
                  X
                </button>
              </div>
              <div className="relative mb-4">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <MagnifyingGlassIcon className="h-6 w-6 stroke-dark-400" />
                </span>
                <input
                  className="block w-80 rounded border p-2 pl-10 text-sm text-white focus:bg-white focus:text-gray-900 focus:outline-none"
                  id="search"
                  type="text"
                  placeholder={placeHolder()}
                />
              </div>
              {tab === "Users" && (
                <SearchUserResult
                  penname={userInfo.penname}
                  reads={userInfo.reads}
                  followers={userInfo.followers}
                  following={userInfo.following}
                  bio={userInfo.bio}
                />
              )}
              {tab === "Books" && (
                <SearchBookResult
                  title={bookInfo.title}
                  date={bookInfo.date}
                  author={bookInfo.author}
                  description={bookInfo.description}
                />
              )}
              {tab === "Chapters" && (
                <SearchChapterResult
                  title={chapterInfo.title}
                  date={chapterInfo.date}
                  author={chapterInfo.author}
                  book={chapterInfo.book}
                  content={chapterInfo.content}
                />
              )}
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
};

export default SearchModal;
