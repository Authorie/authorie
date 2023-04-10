import { useState } from "react";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import DialogLayout from "./DialogLayout";

type props = {
  isOpen: boolean;
  closeModal: () => void;
  price: number;
  chapterId: string;
  title: string;
  cancelClick?: () => void;
  cancelTitle?: string;
  openLoop?: () => void;
};

const DialogBuyChapter = ({
  isOpen,
  closeModal,
  price,
  chapterId,
  title,
  cancelClick,
  cancelTitle,
  openLoop,
}: props) => {
  const router = useRouter();
  const utils = api.useContext();
  const { data: user } = api.user.getData.useQuery();
  const [openNotEnoughCoin, setOpenNotEnoughCoin] = useState(false);
  const buyChapter = api.chapter.buyChapter.useMutation({
    onSuccess() {
      void utils.chapter.getData.invalidate();
      void utils.book.getData.invalidate();
    },
  });

  const onCloseHandler = () => {
    if (openLoop) {
      openLoop();
    }
    setOpenNotEnoughCoin(false);
  };

  const confirmHandler = async () => {
    if (!user?.coin || user?.coin < price) {
      setOpenNotEnoughCoin(true);
      return;
    }
    const promise = buyChapter.mutateAsync(
      {
        chapterId,
      },
      {
        onSuccess() {
          void router.push(`/chapter/${chapterId}`);
        },
      }
    );
    await toast.promise(promise, {
      loading: "purchasing...",
      success: "Your purchase was successful!",
      error: "Failed to purchase",
    });
  };
  return (
    <div>
      <DialogLayout
        isOpen={isOpen}
        closeModal={closeModal}
        title="Buy chapter"
        description={`I want to pay ${price.toLocaleString()} Au to read the chapter called "${title}"`}
        button
        onClick={() => void confirmHandler()}
        cancelClick={cancelClick}
        cancelTitle={cancelTitle}
        openLoop={openLoop}
      />
      {!user?.coin ||
        (user?.coin < price && (
          <DialogLayout
            isOpen={openNotEnoughCoin}
            closeModal={onCloseHandler}
            title="Sorry! You don't have enough coin."
          />
        ))}
    </div>
  );
};

export default DialogBuyChapter;
