import { zodResolver } from "@hookform/resolvers/zod";
import type { Category } from "@prisma/client";
import { BookOwnerStatus, BookStatus } from "@prisma/client";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useReducer, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { HiOutlineChevronLeft, HiOutlinePhoto } from "react-icons/hi2";
import TextareaAutoSize from "react-textarea-autosize";
import z from "zod";
import AuthorCard from "~/components/Book/AuthorCard";
import BookCoverEditable from "~/components/Book/BookCoverEditable";
import DialogLayout from "~/components/Dialog/DialogLayout";
import BookStateInformation from "~/components/Information/BookStateInformation";
import InformationButton from "~/components/Information/InformationButton";
import { CategoryPopover } from "~/components/action/CategoryPopover";
import { EditButton } from "~/components/action/EditButton";
import useImageUpload from "~/hooks/imageUpload";
import { api } from "~/utils/api";

const validationSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Title is required" })
    .max(100, { message: "Title is too long" }),
  description: z.string().max(500, { message: "Description is too long" }),
  author: z.string(),
});

type ValidationSchema = z.infer<typeof validationSchema>;

type DialogState =
  | {
    isOpen: false;
  }
  | {
    isOpen: true;
    title: string;
    description: string;
    action: () => void;
  };

type DialogAction =
  | {
    type: "reset";
  }
  | {
    type:
    | "draftWarning"
    | "deleteWarning"
    | "archiveWarning"
    | "completeWarning";
    action: () => void;
  };

const dialogInitialState = { isOpen: false as const };

const dialogReducer = (state: DialogState, action: DialogAction) => {
  switch (action.type) {
    case "reset":
      return { isOpen: false as const };
    case "draftWarning":
      return {
        isOpen: true as const,
        title: "Are you sure you want to start writing now?",
        description: "Not every authors has responsed to your invitation yet.",
        action: action.action,
      };
    case "deleteWarning":
      return {
        isOpen: true as const,
        title: "Are you sure you want to delete this book?",
        description: "You cannot restore the book after deleted",
        action: action.action,
      };
    case "completeWarning":
      return {
        isOpen: true as const,
        title: "Are you sure you want to complete the book now?",
        description:
          "You cannot go back and continue writing anymore after complete the book",
        action: action.action,
      };
    case "archiveWarning":
      return {
        isOpen: true as const,
        title: "Are you sure you want to archive the book?",
        description:
          "Your reader will not be able to read this book anymore until you unarchive the book.",
        action: action.action,
      };
    default:
      return state;
  }
};

const getStatusPoint = (status: BookOwnerStatus) => {
  switch (status) {
    case BookOwnerStatus.OWNER:
      return 2;
    case BookOwnerStatus.COLLABORATOR:
      return 1;
    case BookOwnerStatus.INVITEE:
    case BookOwnerStatus.REJECTED:
      return 0;
  }
};

interface authors {
  status: BookOwnerStatus;
}

const sortAuthors = (a: authors, b: authors) => {
  return getStatusPoint(b.status) - getStatusPoint(a.status);
};

export default function BookStatusPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const bookId = router.query.bookId as string;
  const penname = router.query.penname as string;
  const [dialogState, dispatchDialog] = useReducer(
    dialogReducer,
    dialogInitialState
  );
  const [isEdit, setIsEdit] = useState(false);
  const [openInformation, setOpenInformation] = useState(false);
  const {
    imageData: bookCover,
    uploadHandler: setBookCover,
    resetImageData: resetBookCover,
  } = useImageUpload();
  const {
    imageData: bookWallpaper,
    uploadHandler: setBookWallpaper,
    resetImageData: resetBookWallpaper,
  } = useImageUpload();
  const utils = api.useContext();
  const { data: categories } = api.category.getAll.useQuery();
  const { data: book } = api.book.getData.useQuery(
    { id: bookId },
    { enabled: router.isReady }
  );
  const deleteBook = api.book.delete.useMutation();
  const removeCollaborator = api.book.removeCollaborator.useMutation({
    onSettled(_data, _error, _variables, _context) {
      void utils.book.getData.invalidate({ id: bookId });
    },
  });
  const inviteCollaborator = api.book.inviteCollaborator.useMutation({
    onSettled(_data, _error, _variables, _context) {
      void utils.book.getData.invalidate({ id: bookId });
    },
  });
  const [addedCategories, setAddedCategories] = useState<Category[]>(
    book?.categories ? book?.categories.map((data) => data.category) : []
  );
  const {
    register,
    reset,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ValidationSchema>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      title: book?.title,
      description: book?.description || "",
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
      void utils.book.getData.invalidate({ id: bookId });
    },
  });

  const updateBook = api.book.update.useMutation({
    async onMutate(variables) {
      await utils.book.getData.cancel({ id: variables.id });
      const prevData = utils.book.getData.getData({ id: variables.id });
      utils.book.getData.setData({ id: variables.id }, (old) =>
        old
          ? {
            ...old,
            description: variables.description
              ? variables.description
              : old.description,
            coverImage: variables.coverImageUrl
              ? variables.coverImageUrl
              : old.coverImage,
            wallpaperImage: variables.wallpaperImageUrl
              ? variables.wallpaperImageUrl
              : old.wallpaperImage,
            categories: addedCategories.map((category) => ({ category })),
            chapters: variables.chaptersArrangement
              ? variables.chaptersArrangement.map((chapterId) => {
                return old.chapters.find(
                  (chapter) => chapter.id === chapterId
                )!;
              })
              : old.chapters,
          }
          : undefined
      );
      return { prevData };
    },
    onError(_error, variables, context) {
      utils.book.getData.setData(variables, context?.prevData);
    },
    onSettled(_data, _error, variables, _context) {
      resetHandler();
      void utils.book.getData.invalidate(variables);
    },
  });

  const uploadImageUrl = api.upload.uploadImage.useMutation();

  const confirmDraftBookHandler = async () => {
    if (book === undefined) return;
    const promiseMoveState = moveState.mutateAsync({
      id: book?.id,
      status: BookStatus.DRAFT,
    });
    await toast.promise(promiseMoveState, {
      loading: "Move to draft state...",
      success: "Your book is in draft state now!",
      error: "Error occured during move state",
    });
  };

  const draftBookHandler = () => {
    if (book === undefined) return;
    const hasCollaborators = book.owners.some(
      ({ status }) => status === BookOwnerStatus.INVITEE
    );
    if (hasCollaborators) {
      dispatchDialog({
        type: "draftWarning",
        action: () => void confirmDraftBookHandler(),
      });
    } else {
      void confirmDraftBookHandler();
    }
  };

  const publishBookHandler = async () => {
    if (book === undefined) return;
    const promiseMoveState = moveState.mutateAsync({
      id: book?.id,
      status: BookStatus.PUBLISHED,
    });
    await toast.promise(promiseMoveState, {
      loading: "Publishing book...",
      success: "Your book is now published!",
      error: "Error occured during publish",
    });
  };

  const confirmCompleteBookHandler = async () => {
    if (book === undefined) return;

    const promiseMoveState = moveState.mutateAsync({
      id: book?.id,
      status: BookStatus.COMPLETED,
    });
    await toast.promise(promiseMoveState, {
      loading: "Completing book...",
      success: "Your book is now completed!",
      error: "Error occured during completed",
    });
  };

  const completeBookHandler = () => {
    if (book === undefined) return;
    dispatchDialog({
      type: "completeWarning",
      action: () => void confirmCompleteBookHandler(),
    });
  };

  const confirmArchiveBookHandler = async () => {
    if (book === undefined) return;
    const promiseMoveState = moveState.mutateAsync({
      id: book?.id,
      status: BookStatus.ARCHIVED,
    });
    await toast.promise(promiseMoveState, {
      loading: "Archive book...",
      success: "Your book is now archived!",
      error: "Error occured during archive",
    });
    void router.push(`/${penname}/book`);
  };

  const archiveBookHandler = () => {
    if (book === undefined) return;
    dispatchDialog({
      type: "archiveWarning",
      action: () => void confirmArchiveBookHandler(),
    });
  };

  const confirmDeleteBookHandler = async () => {
    if (book === undefined) return;
    const promiseDeleteBook = deleteBook.mutateAsync({ id: book?.id });
    await toast.promise(promiseDeleteBook, {
      loading: "Deleting book...",
      success: "Your book is now deleted!",
      error: "Error occured during deleting",
    });
    void router.push(`/${penname}/book`);
  };

  const deleteBookHandler = () => {
    if (book === undefined) return;
    dispatchDialog({
      type: "deleteWarning",
      action: () => void confirmDeleteBookHandler(),
    });
  };

  const toggleCategoryHandler = (category: Category) => {
    if (addedCategories.includes(category)) {
      setAddedCategories(addedCategories.filter((data) => data !== category));
    } else {
      setAddedCategories([...addedCategories, category]);
    }
  };

  const inviteCollaboratorHandler = async (penname: string) => {
    const promiseInvite = inviteCollaborator.mutateAsync({
      penname,
      bookId,
    });
    await toast.promise(promiseInvite, {
      loading: `Inviting ${penname}...`,
      success: "Invited!",
      error: `Error occured while inviting ${penname}`,
    });
    setValue("author", "");
  };

  const removeCollaboratorHandler = async (user: {
    id: string;
    penname: string;
  }) => {
    const promiseRemove = removeCollaborator.mutateAsync({
      userId: user.id,
      bookId: bookId,
    });
    await toast.promise(promiseRemove, {
      loading: `Removing ${user.penname}...`,
      success: `Successful removed ${user.penname}!`,
      error: `Error occured while removing ${user.penname}`,
    });
    if (user.id === session!.user.id) {
      void router.replace(`/${penname}/book`);
    }
  };

  const resetHandler = () => {
    setIsEdit(false);
    reset((formValues) => ({
      ...formValues,
      title: book?.title || "",
      description: book?.description || "",
    }));
    resetBookCover();
    resetBookWallpaper();
    setAddedCategories(book?.categories.map((data) => data.category) || []);
  };

  const onSaveHandler = async (data: ValidationSchema) => {
    if (book === undefined) return;
    const { title, description } = data;
    try {
      const promises = [
        bookCover
          ? uploadImageUrl.mutateAsync({
            image: bookCover,
          })
          : undefined,
        bookWallpaper
          ? uploadImageUrl.mutateAsync({
            image: bookWallpaper,
          })
          : undefined,
      ] as const;
      const [coverImageUrl, wallpaperImageUrl] = await Promise.all(promises);
      const promiseUpdateBook = updateBook.mutateAsync({
        id: book.id,
        title,
        description,
        category: addedCategories.map((category) => category.id),
        coverImageUrl,
        wallpaperImageUrl,
      });
      await toast.promise(promiseUpdateBook, {
        loading: "Updating book...",
        success: "Book updated!",
        error: "Error occured during update",
      });
    } catch (err) {
      toast("Error occured during update");
    }
  };

  return (
    <div className="h-full w-full">
      <DialogLayout
        isOpen={dialogState.isOpen}
        closeModal={() => dispatchDialog({ type: "reset" })}
        title={dialogState.isOpen ? dialogState.title : ""}
        description={dialogState.isOpen ? dialogState.description : ""}
        onClick={dialogState.isOpen ? dialogState.action : () => void {}}
        button
      />
      <div className="relative m-8 overflow-hidden rounded-xl bg-white">
        <div className="absolute right-2 top-2 z-10">
          <InformationButton
            openModal={() => setOpenInformation(true)}
            isOpen={openInformation}
            closeModal={() => setOpenInformation(false)}
            title={"Book State"}
            color={"white"}
            hoverColor="gray-300"
          >
            <BookStateInformation />
          </InformationButton>
        </div>
        <div
          onClick={() => router.back()}
          className="absolute inset-0 left-2 top-2 z-10 w-fit"
        >
          <HiOutlineChevronLeft className="h-8 w-8 cursor-pointer rounded-full border border-gray-500 bg-gray-200 p-1 hover:bg-gray-400" />
        </div>
        <div className="relative overflow-hidden rounded-tl-large shadow-lg">
          {book ? (
            <form
              id="submit-changes"
              onSubmit={(e) => void handleSubmit(onSaveHandler)(e)}
            >
              <div className="absolute h-52 w-full overflow-hidden">
                {book?.wallpaperImage || bookWallpaper ? (
                  <Image
                    src={bookWallpaper ? bookWallpaper : book.wallpaperImage!}
                    alt={`${book.title}'s wallpaper image`}
                    height={200}
                    width={2000}
                  />
                ) : (
                  <div className="h-full w-full bg-authGreen-400" />
                )}
                <div className="absolute inset-0 h-52 w-full bg-gradient-to-t from-white" />
              </div>
              <div className="flex min-h-[850px] flex-col px-20 py-5">
                <div className="z-10 mt-32 flex flex-col">
                  <div className="relative flex gap-5">
                    {!isEdit && (
                      <div className="absolute left-0 top-0 flex gap-1">
                        {book.categories.map((c) => (
                          <div
                            key={c.category.id}
                            onClick={() =>
                              void router.push(`/category/${c.category.title}`)
                            }
                            className="cursor-pointer rounded-full bg-orange-400 px-3 text-sm font-light text-white hover:bg-orange-500"
                          >
                            {c.category.title}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="relative mt-10">
                      {isEdit && (
                        <label
                          htmlFor="BookWallpaper"
                          className="absolute -top-10 left-0"
                        >
                          <input
                            id="BookWallpaper"
                            type="file"
                            accept="image/png, image/jpeg"
                            name="BookWallpaper"
                            className="hidden"
                            onChange={setBookWallpaper}
                          />
                          <HiOutlinePhoto className="w-8 cursor-pointer rounded-md bg-gray-100" />
                        </label>
                      )}
                      <BookCoverEditable
                        title={book.title}
                        coverImage={book?.coverImage || ""}
                        uploadCover={bookCover}
                        isEdit={isEdit}
                        setBookCover={setBookCover}
                      />
                    </div>
                    <div className="mt-12 flex grow flex-col gap-3">
                      <span className="text-2xl font-bold">
                        Book Status:{" "}
                        <span className="text-yellow-600">{book.status}</span>
                      </span>
                      <div className="flex gap-3">
                        {!isEdit ? (
                          <h1 className="text-3xl font-bold">{book.title}</h1>
                        ) : (
                          <div className="flex flex-col">
                            <div className="flex items-end gap-2">
                              <TextareaAutoSize
                                minRows={1}
                                aria-invalid={errors.title ? "true" : "false"}
                                id="title"
                                className="focus:shadow-outline w-96 resize-none rounded-lg border bg-gray-300 px-3 text-3xl font-bold text-black placeholder:text-gray-400 focus:outline-none"
                                placeholder={book.title}
                                {...register("title")}
                              />
                              <p
                                className={`text-xs 
                                ${watch("title", "").length > 100
                                    ? "text-red-500"
                                    : "text-black"
                                  }`}
                              >
                                {watch("title", "").length}/100
                              </p>
                            </div>
                            {errors.title?.message && (
                              <p className="text-xs text-red-400" role="alert">
                                {errors.title.message}
                              </p>
                            )}
                          </div>
                        )}
                        <EditButton
                          isEdit={isEdit}
                          onEdit={() => setIsEdit(true)}
                          isOwner={book.isOwner}
                          reset={resetHandler}
                        />
                      </div>
                      {!isEdit ? (
                        <h3 className="text-sm text-gray-600">
                          {book?.description}
                        </h3>
                      ) : (
                        <>
                          <div className="flex items-end gap-2">
                            <TextareaAutoSize
                              minRows={2}
                              id="description"
                              className="focus:shadow-outline h-24 w-96 resize-none rounded-lg border bg-gray-300 px-3 py-2 text-sm text-black placeholder:text-gray-400 focus:outline-none"
                              placeholder={
                                book.description ||
                                "write the description down..."
                              }
                              {...register("description")}
                            />
                            <p
                              className={`text-xs 
                              ${watch("description", "").length > 500
                                  ? "text-red-500"
                                  : "text-black"
                                }`}
                            >
                              {watch("description", "").length}/500
                            </p>
                          </div>
                          {errors.description?.message && (
                            <p className="text-xs text-red-400" role="alert">
                              {errors.description.message}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                    {!isEdit && (
                      <div className="mt-12 flex flex-col gap-3">
                        {book.status === BookStatus.INITIAL && (
                          <button
                            type="button"
                            onClick={() => void draftBookHandler()}
                            className="rounded-full bg-gradient-to-b from-blue-400 to-blue-500 px-12 py-2 font-semibold text-white hover:bg-gradient-to-b hover:from-blue-500 hover:to-blue-600"
                          >
                            Start Writing
                          </button>
                        )}
                        {book.status === BookStatus.DRAFT && (
                          <button
                            type="button"
                            onClick={() => void publishBookHandler()}
                            className="rounded-full bg-gradient-to-b from-green-400 to-green-500 px-12 py-2 font-semibold text-white hover:bg-gradient-to-b hover:from-green-500 hover:to-green-600"
                          >
                            Publish
                          </button>
                        )}
                        {book.status === BookStatus.PUBLISHED && (
                          <button
                            type="button"
                            onClick={() => void completeBookHandler()}
                            className="rounded-full bg-gradient-to-b from-gray-400 to-gray-500 px-12 py-2 font-semibold text-white hover:bg-gradient-to-b hover:from-gray-500 hover:to-gray-600"
                          >
                            Complete
                          </button>
                        )}
                        {(book.status === BookStatus.INITIAL ||
                          book.status === BookStatus.DRAFT) && (
                            <button
                              type="button"
                              onClick={() => void deleteBookHandler()}
                              className="rounded-full bg-gradient-to-b from-red-400 to-red-500 px-12 py-2 font-semibold text-white hover:bg-gradient-to-b hover:from-red-500 hover:to-red-600"
                            >
                              Delete
                            </button>
                          )}
                        {(book.status === BookStatus.PUBLISHED ||
                          book.status === BookStatus.COMPLETED) && (
                            <button
                              onClick={() => void archiveBookHandler()}
                              className="rounded-full bg-gradient-to-b from-red-400 to-red-500 px-12 py-2 font-semibold text-white hover:bg-gradient-to-b hover:from-red-500 hover:to-red-600"
                            >
                              Archive
                            </button>
                          )}
                      </div>
                    )}
                  </div>
                  {isEdit && categories && (
                    <div className="mt-6">
                      <CategoryPopover
                        isEdit={isEdit}
                        addedCategories={addedCategories}
                        categories={categories}
                        toggleCategoryHandler={toggleCategoryHandler}
                      />
                    </div>
                  )}
                  {!isEdit && (
                    <div className="mt-6 flex w-fit flex-col items-center self-center rounded-lg bg-gray-50 p-4 shadow-lg">
                      <div className="flex items-center justify-center">
                        <h2 className="text-xl font-bold">Author List</h2>
                      </div>
                      {book.status === BookStatus.INITIAL && (
                        <div className="my-4 flex items-center justify-center gap-4">
                          <input
                            className="w-96 rounded-full border border-gray-300 px-5 py-1 outline-none focus:outline-none"
                            placeholder="Enter author's penname..."
                            {...register("author")}
                          />
                          <button
                            type="button"
                            disabled={!book.isOwner}
                            onClick={() =>
                              void inviteCollaboratorHandler(watch("author"))
                            }
                            className="rounded-lg bg-blue-500 px-4 py-1 text-white hover:bg-blue-600"
                          >
                            Invite
                          </button>
                        </div>
                      )}
                      <div className="flex flex-col">
                        {book.status === BookStatus.INITIAL && (
                          <div className="ml-9 flex text-lg font-semibold">
                            <p className="w-72">Author</p>
                            <p>Status</p>
                          </div>
                        )}
                        <ol className="divide-y-2 self-center">
                          {book.owners
                            .sort(sortAuthors)
                            .map((author, index) => (
                              <AuthorCard
                                key={author.user.id}
                                index={index + 1}
                                status={author.status}
                                isUserOwner={
                                  session
                                    ? author.user.id === session.user.id
                                    : false
                                }
                                isBookOwner={book.isOwner}
                                penname={author.user.penname!}
                                image={
                                  author.user.image ||
                                  "/placeholder_profile.png"
                                }
                                isBookInitialStatus={
                                  book.status === BookStatus.INITIAL
                                }
                                onInvite={() =>
                                  void inviteCollaboratorHandler(
                                    author.user.penname!
                                  )
                                }
                                onRemove={() =>
                                  void removeCollaboratorHandler({
                                    id: author.user.id,
                                    penname: author.user.penname!,
                                  })
                                }
                              />
                            ))}
                        </ol>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </form>
          ) : (
            <div className="flex h-96 w-full items-center justify-center">
              <h1 className="text-3xl font-bold">
                This book does not exist...
              </h1>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
