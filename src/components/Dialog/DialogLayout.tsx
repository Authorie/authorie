import { Dialog, Transition } from "@headlessui/react";
import { Fragment, type ReactNode } from "react";

type props = {
  isOpen: boolean;
  closeModal: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
};

const DialogLayout = ({
  isOpen,
  closeModal,
  title,
  description,
  children,
}: props) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-30" onClose={closeModal}>
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
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">{description}</p>
                  </div>
                )}

                <div className="mt-4 w-fit overflow-y-auto px-6 pb-6">
                  {children}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default DialogLayout;
