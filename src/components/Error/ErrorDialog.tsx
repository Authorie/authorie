import { Dialog } from "@headlessui/react";

type props = {
  content?: string;
  isOpen: boolean;
  isCloseHandler: () => void;
  onSaveHandler: () => void;
};

const ErrorDialog = ({
  isOpen,
  isCloseHandler,
  onSaveHandler,
  content,
}: props) => {
  const tryAgainHandler = () => {
    isCloseHandler();
    onSaveHandler();
  };

  return (
    <Dialog open={isOpen} onClose={isCloseHandler} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="flex w-full max-w-sm flex-col items-center rounded-lg bg-white py-6 shadow-lg">
          <Dialog.Title className="mb-1 text-xl font-bold text-red-500">
            Unable to Update Profile
          </Dialog.Title>
          <div>
            <p className="text-black">
              {content || "An error occured while saving changes."}
            </p>
          </div>
          <div className="mt-5 flex gap-6">
            <button
              onClick={isCloseHandler}
              className="h-10 w-32 rounded-lg bg-slate-100 font-bold text-blue-400 shadow-sm hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              onClick={tryAgainHandler}
              className="h-10 w-32 rounded-lg bg-slate-100 text-blue-400 shadow-sm hover:bg-slate-200"
            >
              Try Again
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default ErrorDialog;
