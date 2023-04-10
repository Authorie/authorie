import { Dialog, Transition } from "@headlessui/react";
import { Fragment, type ReactNode } from "react";

type props = {
  isOpen: boolean;
  closeModal: () => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  button?: boolean;
  onClick?: () => void;
  cancelClick?: () => void;
  cancelTitle?: string;
  openLoop?: () => void;
};

const DialogLayout = ({
  isOpen,
  closeModal,
  title,
  description,
  children,
  button,
  onClick,
  cancelClick,
  cancelTitle,
  openLoop,
}: props) => {
  const onCloseHandler = () => {
    if (openLoop) {
      openLoop();
    } else {
      closeModal();
    }
  };
  const onConfirmHandler = () => {
    if (onClick) {
      onClick();
    }
    closeModal();
  };
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-30" onClose={onCloseHandler}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="max-w-full transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {title && (
                  <Dialog.Title
                    as="h3"
                    className=" bg-authGreen-600 px-6 py-4 text-lg font-semibold leading-6 text-white"
                  >
                    {title}
                  </Dialog.Title>
                )}
                {description && (
                  <div className="my-5 px-6">
                    <p className="text-sm text-gray-500">{description}</p>
                  </div>
                )}
                {children && (
                  <div className="mt-4 w-fit overflow-y-auto px-6 pb-6">
                    {children}
                  </div>
                )}
                {button && (
                  <div className="my-3 flex justify-end gap-3 px-6">
                    <button
                      className="h-7 w-24 rounded-lg bg-red-400 text-sm text-white outline-none hover:bg-red-500"
                      onClick={cancelClick ? cancelClick : onCloseHandler}
                    >
                      {cancelTitle ? cancelTitle : "Cancel"}
                    </button>
                    <button
                      className="h-7 w-24 rounded-lg bg-authBlue-500 text-sm text-white outline-none hover:bg-authBlue-700"
                      onClick={onConfirmHandler}
                    >
                      Confirm
                    </button>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default DialogLayout;
