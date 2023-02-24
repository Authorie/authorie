import { Dialog } from "@headlessui/react";
import AuthorResult from "./AuthorResult";

type props = {
  openDialog: boolean;
  onCloseDialog: () => void;
};

const AddAuthorModal = ({ openDialog, onCloseDialog }: props) => {
  return (
    <Dialog open={openDialog} onClose={onCloseDialog}>
      <div className="fixed inset-0" aria-hidden="true" />
      <div className="fixed inset-0 flex items-start justify-center p-4">
        <Dialog.Panel className="relative flex items-start">
          <div className="absolute top-64 flex w-fit flex-col items-start justify-center rounded-xl bg-gray-200 p-2 pt-0">
            <div className="w-full border-b-2 border-gray-300 pt-2">
              <AuthorResult />
              <AuthorResult />
              <AuthorResult />
              <AuthorResult />
            </div>
            <input
              type="text"
              className="focus:shadow-outline mt-2 w-72 rounded-lg bg-white py-2 px-3 text-xs focus:outline-none"
              placeholder="Enter author's pen name..."
            />
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default AddAuthorModal;
