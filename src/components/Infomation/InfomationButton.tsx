import type { ReactNode } from "react";
import DialogLayout from "../Dialog/DialogLayout";

type props = {
  children: ReactNode;
  isOpen: boolean;
  title: string;
  closeModal: () => void;
  openModal: () => void;
};

const InfomationButton = ({
  children,
  title,
  isOpen,
  closeModal,
  openModal,
}: props) => {
  console.log("check");
  return (
    <div>
      <div
        onClick={openModal}
        className="flex h-7 w-7 cursor-pointer items-center justify-center justify-self-end rounded-full border-2 border-gray-400 text-gray-400 hover:bg-gray-200"
      >
        <p>i</p>
      </div>
      <DialogLayout title={title} isOpen={isOpen} closeModal={closeModal}>
        {children}
      </DialogLayout>
    </div>
  );
};

export default InfomationButton;
