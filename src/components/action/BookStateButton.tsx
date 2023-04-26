import { BookStatus, BookOwnerStatus } from "@prisma/client";
import { api, type RouterOutputs } from "~/utils/api";
import DialogLayout from "~/components/Dialog/DialogLayout";
import toast from "react-hot-toast";
import { useState } from "react";
import { useRouter } from "next/router";

type props = {
  book: RouterOutputs["book"]["getData"];
  penname: string;
};

export const BookStateButton = ({ book, penname }: props) => {
  const [openWarning, setOpenWarning] = useState({
    isOpen: false,
    title: "",
    description: "",
    action: () => void {},
  });
  const router = useRouter();
  const bookId = router.query.bookId as string;
  const utils = api.useContext();
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
      void utils.book.getData.invalidate({ id: bookId });
    },
  });
  const deleteBook = api.book.delete.useMutation({
    onSettled(_data, _error, variables, _context) {
      void utils.book.getData.invalidate(variables);
    },
  });
  const confirmDraftBookHandler = async () => {
    if (book === undefined) return;
    const promiseMoveState = moveState.mutateAsync({
      id: book.id,
      status: BookStatus.DRAFT,
    });
    await toast.promise(promiseMoveState, {
      loading: "Move to draft state...",
      success: "Your book is in draft state now!",
      error: "Error occured during move state",
    });
  };

  const draftBookHandler = () => {
    const hasInvitees = book.owners.some(
      ({ status }) => status === BookOwnerStatus.INVITEE
    );
    if (hasInvitees) {
      setOpenWarning({
        isOpen: true,
        title: "Are you sure you want to start writing now?",
        description: "Not every authors has responsed to your invitation yet.",
        action: () => void confirmDraftBookHandler(),
      });
    } else {
      void confirmDraftBookHandler();
    }
  };

  const onDraftHandler = () => {
    setOpenWarning({
      isOpen: true,
      title: "Move book to draft",
      description:
        "Are you sure you want to move to draft state? You will not be able to invite other authors anymore",
      action: () => void draftBookHandler(),
    });
  };

  const publishBookHandler = async () => {
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

  const onPublishHandler = () => {
    setOpenWarning({
      isOpen: true,
      title: "Publish this book",
      description:
        "Are you sure you want to move to Publish state? People will now see your book",
      action: () => void publishBookHandler(),
    });
  };

  const completeBookHandler = async () => {
    if (book.chapters.some((chapter) => chapter.publishedAt === null)) {
      toast.error("You have to publish all chapters before complete book");
      return;
    }
    const promiseMoveState = moveState.mutateAsync({
      id: book.id,
      status: BookStatus.COMPLETED,
    });
    await toast.promise(promiseMoveState, {
      loading: "Completing book...",
      success: "Your book is now completed!",
      error: "Error occured during completed",
    });
  };

  const onCompleteHandler = () => {
    setOpenWarning({
      isOpen: true,
      title: "Complete this book",
      description:
        "Are you sure you want to complete the book? You will no longer be able to publish new chapters",
      action: () => void completeBookHandler(),
    });
  };

  const archiveBookHandler = async () => {
    if (book.chapters.some((chapter) => chapter.publishedAt === null)) {
      toast.error("You have to publish all chapters before archive book");
      return;
    }
    const promiseMoveState = moveState.mutateAsync({
      id: book.id,
      status: BookStatus.ARCHIVED,
    });
    await toast.promise(promiseMoveState, {
      loading: "Archive book...",
      success: "Your book is now archived!",
      error: "Error occured during archive",
    });
    void router.push(`/${penname}/book`);
  };

  const onArchiveHandler = () => {
    setOpenWarning({
      isOpen: true,
      title: "Archive this book",
      description:
        "Are you sure you want to archive the book? People who do not own the book or did not buy the chapter will not be able to see the book and chapters anymore until you unarchive",
      action: () => void archiveBookHandler(),
    });
  };

  const deleteBookHandler = async () => {
    const promiseDeleteBook = deleteBook.mutateAsync({ id: book.id });
    await toast.promise(promiseDeleteBook, {
      loading: "Deleting book...",
      success: "Your book is now deleted!",
      error: "Error occured during deleting",
    });
    void router.push(`/${penname}/book`);
  };

  const onDeleteHandler = () => {
    setOpenWarning({
      isOpen: true,
      title: "Delete this book",
      description:
        "Are you sure you want to delete the book? The book will be gone forever",
      action: () => void deleteBookHandler(),
    });
  };
  return (
    <>
      <DialogLayout
        button
        isOpen={openWarning.isOpen}
        closeModal={() => setOpenWarning({ ...openWarning, isOpen: false })}
        title={openWarning.title}
        description={openWarning.description}
        onClick={openWarning.action}
      />
      {book.status === BookStatus.INITIAL && (
        <button
          type="button"
          onClick={() => void onDraftHandler()}
          className="h-8 w-32 rounded-md bg-gradient-to-b from-authBlue-500 to-authBlue-600 text-sm font-semibold text-white hover:bg-gradient-to-b hover:from-authBlue-600 hover:to-authBlue-700"
        >
          Start Writing
        </button>
      )}
      {book.status === BookStatus.DRAFT && (
        <button
          type="button"
          onClick={() => void onPublishHandler()}
          className="h-8 w-32 rounded-lg bg-gradient-to-b from-green-400 to-green-500 text-sm font-semibold text-white hover:bg-gradient-to-b hover:from-green-500 hover:to-green-600"
        >
          Publish
        </button>
      )}
      {book.status === BookStatus.PUBLISHED && (
        <button
          type="button"
          onClick={() => void onCompleteHandler()}
          className="h-8 w-32 rounded-lg bg-gradient-to-b from-gray-400 to-gray-500 text-sm font-semibold text-white hover:bg-gradient-to-b hover:from-gray-500 hover:to-gray-600"
        >
          Complete
        </button>
      )}
      {(book.status === BookStatus.INITIAL ||
        book.status === BookStatus.DRAFT) && (
        <button
          type="button"
          onClick={() => void onDeleteHandler()}
          className="h-8 w-32 rounded-lg bg-gradient-to-b from-red-400 to-red-500 text-sm font-semibold text-white hover:bg-gradient-to-b hover:from-red-500 hover:to-red-600"
        >
          Delete
        </button>
      )}
      {(book.status === BookStatus.PUBLISHED ||
        book.status === BookStatus.COMPLETED) && (
        <button
          type="button"
          onClick={() => void onArchiveHandler()}
          className="h-8 w-32 rounded-lg bg-gradient-to-b from-red-400 to-red-500 text-sm font-semibold text-white hover:bg-gradient-to-b hover:from-red-500 hover:to-red-600"
        >
          Archive
        </button>
      )}
    </>
  );
};
