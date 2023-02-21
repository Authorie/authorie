import SearchUserResult from "./SearchUserResult";
import { Dialog } from '@headlessui/react';
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

type props = {
  onDialogHandler: (open: boolean) => void;
  openDialog: boolean;
};

const SearchModal = ({ onDialogHandler, openDialog }: props) => {
  const userInfo = {
    penname: "four58",
    userId: 1324532,
    reads: 50,
    followers: 2400,
    following: 25,
    bio: "when the dusk approached, the delusion following by. meticulous creating the splendid night to our night time. when the dusk approached, the delusion following by. meticulous creating the splendid night to our night time."
  };

  return (
    <>
      <Dialog open={openDialog} onClose={() => onDialogHandler(false)}>
        {/* The backdrop, rendered as a fixed sibling to the panel container */}
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        {/* Full-screen container to center the panel */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
        {/* The actual dialog panel */}
        <Dialog.Panel className="relative flex w-[800px] flex-col rounded-lg border-0 bg-white p-10 shadow-lg outline-none focus:outline-none">
          <div className="mb-5 flex items-start justify-between">
            <Dialog.Title className="text-xl font-semibold">Search for users</Dialog.Title>
            <button
              className="text-xl font-semibold text-black"
              onClick={() => onDialogHandler(false)}
            >
              X
            </button>
          </div>
          <div className="relative mb-4">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <MagnifyingGlassIcon className="w-6 h-6 stroke-dark-400" />
            </span>
            <input
            className="block w-80 p-2 text-sm text-white pl-10 focus:outline-none focus:bg-white focus:text-gray-900 border rounded"
            id="searchUser"
            type="text"
            placeholder="Enter User Id"
            />
          </div>
          <SearchUserResult
            penname={userInfo.penname}
            userId={userInfo.userId}
            reads={userInfo.reads}
            followers={userInfo.followers}
            following={userInfo.following}
            bio={userInfo.bio}
          />
        </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
};

export default SearchModal;
