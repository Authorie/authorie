import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
import toast from "react-hot-toast";
import { api } from "~/utils/api";
import DialogLayout from "./DialogLayout";

type props = {
  isOpen: boolean;
  closeModal: () => void;
  price: number;
  bookId: string | null;
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
  bookId,
  chapterId,
  title,
  cancelClick,
  cancelTitle,
  openLoop,
}: props) => {
  const router = useRouter();
  const utils = api.useContext();
  const { status } = useSession();
  const [openNotEnoughCoin, setOpenNotEnoughCoin] = useState(false);
  const { data: user } = api.user.getData.useQuery(undefined, {
    enabled: status === "authenticated",
  });
  const buyChapter = api.chapter.buyChapter.useMutation({
    onSuccess(_data, variables, _context) {
      void utils.user.getData.invalidate(undefined);
      void utils.chapter.getData.invalidate({ id: variables.chapterId });
      if (bookId) void utils.book.getData.invalidate({ id: bookId });
      void router.push(`/chapter/${variables.chapterId}`);
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
    const promise = buyChapter.mutateAsync({
      chapterId,
    });
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
        button
        onClick={() => void confirmHandler()}
        onClickCancel={cancelClick}
        cancelButtonLabel={cancelTitle}
        openLoop={openLoop}
      >
        <div className="flex items-center">
          I want to pay
          <Image
            src="/authorie_coin_logo.svg"
            alt="Authorie coin logo"
            width={30}
            height={30}
            className="mx-1 h-4 w-4"
          />
          <span className="mr-1 font-semibold text-authYellow-500">
            {price} Au
          </span>
          to read the chapter called &quot;
          <span className="font-semibold text-authGreen-600">{title}</span>
          &quot;
        </div>
      </DialogLayout>
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
