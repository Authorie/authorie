import { EyeIcon, HeartIcon, StarIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { useRouter } from "next/router";
import StarIconSolid from "@heroicons/react/24/solid/StarIcon";
import type { MouseEvent } from "react";
import { api } from "@utils/api";
import { BookStatus } from "@prisma/client";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

type props = {
  id: string;
  title: string;
  description: string | null;
  read: number;
  like: number;
  isOwner: boolean;
  coverImage: string | null;
  status: string;
};

const Book = ({
  title,
  description,
  read,
  like,
  id,
  isOwner,
  coverImage,
  status,
}: props) => {
  const router = useRouter();
  const utils = api.useContext();
  const penname = router.query.penname as string;
  const { data: isFavorite } = api.book.isFavorite.useQuery({ id: id });
  const moveState = api.book.moveState.useMutation({
    async onMutate(newBook) {
      await utils.book.getData.cancel();
      const prevData = utils.book.getData.getData({ id: newBook.id });
      if (!prevData) return;
      const book = {
        ...prevData,
        status: newBook.status,
      };
      utils.book.getData.setData({ id: newBook.id }, book);
      return { prevData };
    },
    onSettled: () => {
      void utils.book.invalidate();
    },
  });
  const unfavoriteBook = api.book.unfavorite.useMutation({
    onMutate: async () => {
      await utils.book.isFavorite.cancel();
      const previousFavorite = utils.book.isFavorite.getData();
      utils.book.isFavorite.setData({ id: id }, (old) => !old);
      return { previousFavorite };
    },
    onSettled: () => {
      void utils.book.invalidate();
    },
  });
  const favoriteBook = api.book.favorite.useMutation({
    onMutate: async () => {
      await utils.book.isFavorite.cancel();
      const previousFavorite = utils.book.isFavorite.getData();
      utils.book.isFavorite.setData({ id: id }, (old) => !old);
      return { previousFavorite };
    },
    onSettled: () => {
      void utils.book.invalidate();
    },
  });

  const onClickHandler = () => {
    if (!isOwner) {
      void router.push(`/${penname}/book/${id}`);
    } else {
      return;
    }
  };

  const toggleFavoriteHandler = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (isFavorite) {
      unfavoriteBook.mutate({ id: id });
    } else {
      favoriteBook.mutate({ id: id });
    }
  };

  const publishBookHandler = async (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    try {
      const promiseMoveState = moveState.mutateAsync({
        id: id,
        status: BookStatus.PUBLISHED,
      });
      await toast.promise(promiseMoveState, {
        pending: "Publishing book...",
        success: "Your book is now published!",
      });
    } catch (err) {
      toast("Error occured during publish");
    }
  };

  return (
    <div
      onClick={onClickHandler}
      className={`${"flex cursor-pointer transition duration-100 ease-in-out"} ${
        isOwner ? "group/bookOwner" : "hover:-translate-y-1 hover:scale-[1.01]"
      }`}
    >
      <div className="h-72 w-3 rounded-r-lg bg-authGreen-600 shadow-lg" />
      <div className="relative flex w-52 flex-col rounded-l-lg bg-white pb-2 shadow-lg">
        {isOwner && (
          <>
            <div
              className={`
              ${status === BookStatus.INITIAL ? "bg-gray-400" : ""} 
              ${status === BookStatus.DRAFT ? "bg-orange-400" : ""} 
              ${status === BookStatus.PUBLISHED ? "bg-green-400" : ""} 
              ${status === BookStatus.COMPLETED ? "bg-blue-400" : ""} 
              ${"absolute top-0 left-0 z-10 px-2 text-xs text-white"}
              `}
            >
              {status}
            </div>
            {status === "DRAFT" && (
              <button
                onClick={(e) => void publishBookHandler(e)}
                className="absolute top-2 right-2 z-20 rounded-full border border-white bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700"
              >
                Publish now
              </button>
            )}
            <div className="invisible absolute z-10 flex h-full w-52 flex-col items-center justify-center gap-6 bg-black/60 group-hover/bookOwner:visible">
              <button
                onClick={() => void router.push(`/${penname}/book/${id}`)}
                className="w-36 border-2 border-white bg-transparent py-2 text-white hover:bg-authGreen-600"
              >
                View Book
              </button>
              <button
                onClick={() =>
                  void router.push(`/${penname}/book/${id}/status`)
                }
                className="w-36 border-2 border-white bg-transparent py-2 text-white hover:bg-authGreen-600"
              >
                View Status
              </button>
            </div>
          </>
        )}
        <div className="relative h-28 w-full overflow-hidden rounded-tl-lg">
          {coverImage ? (
            <Image src={coverImage} alt="book picture" fill />
          ) : (
            <div className="h-full w-full bg-authGreen-400" />
          )}
          {!isOwner && (
            <button onClick={toggleFavoriteHandler}>
              {isFavorite ? (
                <StarIcon className="absolute bottom-0 right-0 h-10 w-10 text-yellow-400 hover:text-yellow-500" />
              ) : (
                <StarIconSolid className="absolute bottom-0 right-0 h-10 w-10 text-yellow-400 hover:text-yellow-500" />
              )}
            </button>
          )}
        </div>
        <div className="flex grow flex-col justify-between px-2 pt-2">
          <div className="flex w-full flex-col justify-center gap-2">
            <h1 className="font-bold">{title}</h1>
            <p className="text-xs font-light line-clamp-6">{description}</p>
          </div>
          <div className="flex justify-between">
            <div className="mt-2 flex items-center gap-1">
              <EyeIcon className="h-5 w-5 text-authGreen-600" />
              <p className="text-xs font-medium text-authGreen-600">{read}</p>
            </div>
            <div className="mt-2 flex items-center gap-1">
              <HeartIcon className="h-5 w-5 text-red-400" />
              <p className="text-xs font-medium text-red-400">{like}</p>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Book;
