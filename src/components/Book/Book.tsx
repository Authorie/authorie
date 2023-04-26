import { BookOwnerStatus, BookStatus } from "@prisma/client";
import dayjs from "dayjs";
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
import { api, type RouterOutputs } from "~/utils/api";

type props = {
  book: RouterOutputs["book"]["getData"];
};

const Book = ({ book }: props) => {
  const router = useRouter();
  const { status } = useSession();
  const utils = api.useContext();
  const penname = router.query.penname as string;
  const ownerPenname = book.owners.find(
    (owner) => owner.status === BookOwnerStatus.OWNER
  )!.user.penname!;
  const publishedChapter = book.chapters
    .filter(
      (chapters) =>
        chapters.publishedAt && dayjs().isAfter(chapters.publishedAt)
    )
    .sort((a, b) => (a.chapterNo ?? 0) - (b.chapterNo ?? 0));
  const latestChapter = publishedChapter.at(-1);

  const responseInvitation = api.book.responseCollaborationInvite.useMutation({
    async onMutate(variables) {
      await utils.book.getData.cancel();
      const prevData = utils.book.getData.getData({ id: variables.bookId });
      utils.book.getData.setData({ id: variables.bookId }, (old) => {
        if (!old) return old;
        return {
          ...old,
          isCollborator: variables.accept,
        };
      });
      return { prevData };
    },
    onSettled(_data, error, variables, context) {
      if (error) {
        utils.book.getData.setData({ id: variables.bookId }, context?.prevData);
      }
      void utils.book.getData.invalidate({ id: variables.bookId });
    },
  });
  const moveState = api.book.moveState.useMutation({
    async onMutate(variables) {
      await utils.book.getData.cancel();
      const prevData = utils.book.getData.getData({ id: variables.id });
      utils.book.getData.setData({ id: variables.id }, (old) => {
        if (!old) return old;
        return {
          ...old,
          status: variables.status,
        };
      });
      return { prevData };
    },
    onSettled(_data, error, variables, context) {
      if (error) {
        utils.book.getData.setData({ id: variables.id }, context?.prevData);
      }
      void utils.book.getData.invalidate({ id: variables.id });
    },
  });
  const unfavoriteBook = api.book.unfavorite.useMutation({
    async onMutate(variables) {
      await utils.book.getData.cancel(variables);
      const previousBook = utils.book.getData.getData(variables);
      utils.book.getData.setData(variables, (old) => {
        if (old === undefined) return old;
        return {
          ...old,
          isFavorite: false,
        };
      });
      return { previousBook };
    },
    onSettled(_data, error, variables, context) {
      if (error) {
        utils.book.getData.setData(variables, context?.previousBook);
      }
      void utils.book.getData.invalidate(variables);
    },
  });
  const favoriteBook = api.book.favorite.useMutation({
    async onMutate(variables) {
      await utils.book.getData.cancel(variables);
      const previousBook = utils.book.getData.getData(variables);
      utils.book.getData.setData(variables, (old) => {
        if (old === undefined) return old;
        return {
          ...old,
          isFavorite: true,
        };
      });
      return { previousBook };
    },
    onError(_error, variables, context) {
      utils.book.getData.setData(variables, context?.previousBook);
    },
    onSettled(_data, _error, variables, _context) {
      void utils.book.getData.invalidate(variables);
    },
  });

  const toggleFavoriteHandler = (e: MouseEvent) => {
    e.stopPropagation();
    if (book.isFavorite) {
      unfavoriteBook.mutate({ id: book.id });
    } else {
      favoriteBook.mutate({ id: book.id });
    }
  };

  const publishBookHandler = async (e: MouseEvent) => {
    e.stopPropagation();
    const promiseMoveState = moveState.mutateAsync({
      id: book.id,
      status: BookStatus.PUBLISHED,
    });
    await toast.promise(promiseMoveState, {
      loading: "Publishing book...",
      success: "Your book is now published!",
      error: "Error occured during publish",
    });
  };

  const unarchiveBookHandler = async (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const promiseMoveState = moveState.mutateAsync({
      id: book.id,
      status:
        book.previousStatus === BookStatus.PUBLISHED
          ? BookStatus.PUBLISHED
          : BookStatus.COMPLETED,
    });
    await toast.promise(promiseMoveState, {
      loading: "returning to previous state...",
      success: "unarchive successful!",
      error: "Fail to unarchive",
    });
  };

  const respondInvitationHandler = (
    e: MouseEvent<HTMLButtonElement>,
    accept: boolean
  ) => {
    e.stopPropagation();
    responseInvitation.mutate({
      bookId: book.id,
      accept,
    });
  };

  const changeStateHandler = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    void router.push(`/${penname}/book/${book.id}/status`);
  };

  return (
    <div
      onClick={() => {
        if (book.status === BookStatus.INITIAL) {
          void router.push(`/${penname}/book/${book.id}/status`);
        } else {
          void router.push(`/${penname}/book/${book.id}`);
        }
      }}
      className={`${book.status === BookStatus.ARCHIVED
          ? ""
          : "cursor-pointer transition duration-100 ease-in-out hover:-translate-y-1 hover:scale-[1.01]"
        } flex`}
    >
      <div className="h-72 w-3 rounded-r-lg bg-authGreen-600 shadow-lg" />
      <div className="relative flex w-52 flex-col rounded-l-lg pb-2 shadow-lg">
        {book.isInvited && book.status === BookStatus.INITIAL && (
          <div className="absolute bottom-4 right-2 z-20 flex h-fit w-fit flex-col items-center justify-center gap-2 rounded bg-gray-800/70 p-2">
            <span className="w-40 text-sm text-white">
              <span className="font-semibold">{ownerPenname}</span> has invited
              you to write a book!
            </span>
            <div className="flex w-full items-center justify-center gap-4">
              <button
                onClick={(e) => respondInvitationHandler(e, true)}
                className="h-6 w-20 rounded-full bg-green-500 text-xs font-semibold text-white hover:bg-green-600"
              >
                Accept
              </button>
              <button
                onClick={(e) => respondInvitationHandler(e, false)}
                className="h-6 w-20 rounded-full bg-red-500 text-xs font-semibold text-white hover:bg-red-600"
              >
                Reject
              </button>
            </div>
          </div>
        )}
        {book.coverImage ? (
          <div className="absolute h-72 w-52 overflow-hidden">
            <Image
              src={book.coverImage}
              alt="book picture"
              width={208}
              height={288}
            />
          </div>
        ) : (
          <div className="absolute h-full w-full bg-authGreen-400" />
        )}
        {book.status === BookStatus.PUBLISHED && latestChapter && (
          <div className="absolute right-0 top-0 z-10 flex w-full justify-between text-xs font-semibold text-white">
            {latestChapter.publishedAt &&
              dayjs().isBefore(latestChapter.publishedAt, "day") && (
                <p className="bg-red-400 px-2">New</p>
              )}
            <p className="line-clamp-1 bg-slate-500 px-2 font-medium">
              #{publishedChapter.length} - {latestChapter.title}
            </p>
          </div>
        )}
        {(book.isOwner || book.isCollborator) && (
          <>
            {book.status !== BookStatus.PUBLISHED && (
              <div
                className={`
              ${book.status === BookStatus.INITIAL ? "bg-gray-400" : ""} 
              ${book.status === BookStatus.DRAFT ? "bg-orange-400" : ""} 
              ${book.status === BookStatus.COMPLETED ? "bg-blue-400" : ""} 
              ${book.status === BookStatus.ARCHIVED ? "hidden" : ""}
              absolute left-0 top-0 z-10 px-2 text-xs text-white
              `}
              >
                {book.status}
              </div>
            )}
            {book.isOwner && book.status === BookStatus.DRAFT && (
              <button
                onClick={(e) => void publishBookHandler(e)}
                className="absolute -right-5 -top-2 z-20 rounded-lg bg-green-500 px-2 py-1 text-sm font-semibold text-white shadow-lg hover:bg-green-700"
              >
                Publish this book
              </button>
            )}
            {book.isOwner && book.status === BookStatus.ARCHIVED && (
              <button
                onClick={(e) => void unarchiveBookHandler(e)}
                className="absolute right-2 top-2 z-20 rounded-full border border-white bg-yellow-600 px-2 py-1 text-xs text-white hover:bg-yellow-700"
              >
                Unarchive
              </button>
            )}
            {book.isOwner && book.status === BookStatus.INITIAL && (
              <button
                onClick={changeStateHandler}
                className="absolute bottom-2 right-2 z-20 rounded-full bg-gray-400 px-1 py-1 text-xs font-semibold text-white hover:bg-gray-500"
              >
                Change state to start the book
              </button>
            )}
          </>
        )}
        {status === "authenticated" &&
          !book.isOwner &&
          !book.isCollborator &&
          (book.status === BookStatus.PUBLISHED ||
            book.status === BookStatus.COMPLETED) && (
            <div
              className="group/star absolute bottom-0 right-0 z-20 h-10 w-10"
              onClick={toggleFavoriteHandler}
            >
              {book.isFavorite ? (
                <HiStar className="h-10 w-10 text-yellow-400 hover:text-yellow-600" />
              ) : (
                <HiOutlineStar className="h-10 w-10 text-yellow-400 group-hover/star:text-yellow-600" />
              )}
            </div>
          )}
        <div className="z-10 flex grow flex-col justify-between">
          <div className="mt-10 flex w-full flex-col items-center justify-center gap-2 px-3">
            <span className="line-clamp-1 rounded-full bg-white/60 px-2 font-bold">
              {book.title}
            </span>
          </div>
          {book.status !== BookStatus.INITIAL &&
            book.status !== BookStatus.DRAFT && (
              <div className="ml-2 flex w-fit items-center gap-4 rounded-full bg-white px-2">
                <div className="flex items-center gap-1">
                  <HiOutlineEye className="h-5 w-5 text-authGreen-600" />
                  <p className="text-xs font-medium text-authGreen-600">
                    {book.chapters.reduce(
                      (prev, curr) => prev + curr._count.views,
                      0
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <HiOutlineHeart className="h-5 w-5 text-red-400" />
                  <p className="text-xs font-medium text-red-400">
                    {book.chapters.reduce(
                      (prev, curr) => prev + curr._count.likes,
                      0
                    )}
                  </p>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Book;
