import { BookStatus } from "@prisma/client";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import type { MouseEvent } from "react";
import toast from "react-hot-toast";
import {
  HiOutlineEye,
  HiOutlineHeart,
  HiOutlineStar,
  HiStar,
} from "react-icons/hi2";
import { api } from "~/utils/api";

type props = {
  id: string;
  title: string;
  description: string | null;
  read: number;
  like: number;
  isOwner: boolean;
  coverImage: string | null;
  status: BookStatus;
  ownerPenname: string | null;
  isCollaborator: boolean;
  isInvitee: boolean;
};

const Book = ({
  title,
  read,
  like,
  id,
  isOwner,
  coverImage,
  status,
  ownerPenname,
  isCollaborator,
  isInvitee,
}: props) => {
  const router = useRouter();
  const utils = api.useContext();
  const { status: authStatus } = useSession();
  const penname = router.query.penname as string;
  const { data: isFavorite } = api.book.isFavorite.useQuery(
    { id: id },
    { enabled: authStatus === "authenticated" }
  );
  const responseInvitation = api.user.responseCollaborationInvite.useMutation({
    onSuccess: () => {
      void utils.book.invalidate();
    },
    onSettled: () => {
      void utils.book.invalidate();
    },
  });
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
    if (status !== BookStatus.ARCHIVED) {
      void router.push(`/${penname}/book/${id}`);
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
    const promiseMoveState = moveState.mutateAsync({
      id: id,
      status: BookStatus.PUBLISHED,
    });
    await toast.promise(promiseMoveState, {
      loading: "Publishing book...",
      success: "Your book is now published!",
      error: "Error occured during publish",
    });
  };

  const responseInvaitationHandler = (
    e: MouseEvent<HTMLButtonElement>,
    response: boolean
  ) => {
    e.stopPropagation();
    responseInvitation.mutate({
      bookId: id,
      accept: response,
    });
  };

  return (
    <div
      onClick={onClickHandler}
      className={`${
        status === BookStatus.ARCHIVED
          ? ""
          : "cursor-pointer transition duration-100 ease-in-out hover:-translate-y-1 hover:scale-[1.01]"
      } flex`}
    >
      <div className="h-72 w-3 rounded-r-lg bg-authGreen-600 shadow-lg" />
      <div className="relative flex w-52 flex-col rounded-l-lg pb-2 shadow-lg">
        {isInvitee && status === BookStatus.INITIAL && (
          <div className="absolute bottom-4 right-2 z-20 flex h-fit w-fit flex-col items-center justify-center gap-2 rounded bg-gray-800/70 p-2">
            <h1 className="w-40 text-sm text-white">
              <span className="font-semibold">{ownerPenname}</span> has invited
              you to write a book!
            </h1>
            <div className="flex w-full items-center justify-center gap-4">
              <button
                onClick={(e) => responseInvaitationHandler(e, true)}
                className="h-6 w-20 rounded-full bg-green-500 text-xs font-semibold text-white hover:bg-green-600"
              >
                Accept
              </button>
              <button
                onClick={(e) => responseInvaitationHandler(e, false)}
                className="h-6 w-20 rounded-full bg-red-500 text-xs font-semibold text-white hover:bg-red-600"
              >
                Reject
              </button>
            </div>
          </div>
        )}
        {coverImage ? (
          <Image src={coverImage} alt="book picture" fill />
        ) : (
          <div className="absolute h-full w-full bg-authGreen-400" />
        )}
        {(isOwner || isCollaborator) && (
          <>
            <div
              className={`
              ${status === BookStatus.INITIAL ? "bg-gray-400" : ""} 
              ${status === BookStatus.DRAFT ? "bg-orange-400" : ""} 
              ${status === BookStatus.PUBLISHED ? "bg-green-400" : ""} 
              ${status === BookStatus.COMPLETED ? "bg-blue-400" : ""} 
              ${status === BookStatus.ARCHIVED ? "hidden" : ""}
              ${"absolute left-0 top-0 z-10 px-2 text-xs text-white"}
              `}
            >
              {status}
            </div>
            {status === BookStatus.DRAFT && (
              <button
                onClick={(e) => void publishBookHandler(e)}
                className="absolute right-2 top-2 z-20 rounded-full border border-white bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700"
              >
                Publish now
              </button>
            )}
            {status === BookStatus.ARCHIVED && (
              <button className="absolute right-2 top-2 z-10 rounded-full border border-white bg-yellow-600 px-2 py-1 text-xs text-white hover:bg-yellow-700">
                Unarchive
              </button>
            )}
          </>
        )}
        {!isOwner &&
          (status === BookStatus.PUBLISHED ||
            status === BookStatus.COMPLETED) &&
          authStatus === "authenticated" && (
            <button onClick={toggleFavoriteHandler}>
              {isFavorite ? (
                <HiOutlineStar className="absolute right-0 top-0 h-10 w-10 text-yellow-400 hover:text-yellow-500" />
              ) : (
                <HiStar className="absolute right-0 top-0 h-10 w-10 text-yellow-400 hover:text-yellow-500" />
              )}
            </button>
          )}
        <div className="z-10 flex grow flex-col justify-between">
          <div className="mt-10 flex w-full flex-col items-center justify-center gap-2 px-3">
            <h1 className="rounded-full bg-white/60 px-2 font-bold">{title}</h1>
          </div>
          {status !== BookStatus.DRAFT && status !== BookStatus.INITIAL && (
            <div className="ml-2 flex w-fit items-center gap-4 rounded-full bg-white px-2">
              <div className="flex items-center gap-1">
                <HiOutlineEye className="h-5 w-5 text-authGreen-600" />
                <p className="text-xs font-medium text-authGreen-600">{read}</p>
              </div>
              <div className="flex items-center gap-1">
                <HiOutlineHeart className="h-5 w-5 text-red-400" />
                <p className="text-xs font-medium text-red-400">{like}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Book;
