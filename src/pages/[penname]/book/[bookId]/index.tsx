import { Popover } from "@headlessui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Category } from "@prisma/client";
import { BookOwnerStatus, BookStatus } from "@prisma/client";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import InfomationButton from "~/components/Infomation/InfomationButton";
import TextareaAutoSize from "react-textarea-autosize";
import {
  HiEye,
  HiHeart,
  HiOutlineChevronLeft,
  HiOutlineStar,
  HiPhoto,
  HiStar,
} from "react-icons/hi2";
import z from "zod";
import ChapterCardList from "~/components/Chapter/ChapterCardList";
import DialogLayout from "~/components/Dialog/DialogLayout";
import { EditButton } from "~/components/action/EditButton";
import useImageUpload from "~/hooks/imageUpload";
import { api } from "~/utils/api";
import BookManagementInformation from "~/components/Infomation/BookManagementInformation";

const validationSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Title is required" })
    .max(100, { message: "Title is too long" }),
  description: z.string().max(500, { message: "Description is too long" }),
});

const BookContent = () => {
  const [openWarning, setOpenWarning] = useState(false);
  const router = useRouter();
  const { status } = useSession();
  const bookId = router.query.bookId as string;
  const penname = router.query.penname as string;
  const utils = api.useContext();
  const [openInformation, setOpenInformation] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const { data: categories } = api.category.getAll.useQuery(undefined);
  const { data: book, isFetched: isBookFetched } = api.book.getData.useQuery(
    {
      id: bookId,
    },
    {
      enabled: router.isReady,
    }
  );
  const { data: collaborators } = api.user.getBookCollaborators.useQuery(
    {
      bookId: bookId,
    },
    {
      enabled: router.isReady,
    }
  );
  const { data: isFavorite } = api.book.isFavorite.useQuery(
    { id: bookId },
    {
      enabled: router.isReady,
    }
  );
  const [addedCategories, setAddedCategories] = useState(
    book?.categories.map((data) => data.category) || []
  );
  const [arrangedChapters, setArrangedChapters] = useState(
    book?.chapters.sort((x, y) => {
      if (x.chapterNo || y.chapterNo)
        return (x.chapterNo ?? 0) - (y.chapterNo ?? 0);
      if (x.publishedAt || y.publishedAt)
        return (
          (x.publishedAt?.getTime() ?? 0) - (y.publishedAt?.getTime() ?? 0)
        );
      return 0;
    }) || []
  );
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
  const uploadImageUrl = api.upload.uploadImage.useMutation();
  const updateBook = api.book.update.useMutation({
    async onMutate(newBook) {
      await utils.book.getData.cancel();
      const prevData = utils.book.getData.getData({ id: newBook.id });
      if (!prevData) return;
      const book = {
        ...prevData,
        title: newBook.title !== undefined ? newBook.title : prevData.title,
        description:
          newBook.description !== undefined
            ? newBook.description
            : prevData.description,
        categories: addedCategories.map((data) => ({ category: data })),
        coverImage:
          newBook.coverImageUrl !== undefined
            ? newBook.coverImageUrl
            : prevData.coverImage,
        wallpaperImage:
          newBook.wallpaperImageUrl !== undefined
            ? newBook.wallpaperImageUrl
            : prevData.wallpaperImage,
      };
      utils.book.getData.setData({ id: newBook.id }, book);
      return { prevData };
    },
    onError(_, newPost, ctx) {
      if (!ctx?.prevData) return;
      utils.book.getData.setData({ id: newPost.id }, ctx.prevData);
    },
    onSuccess() {
      resetHandler();
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
  const deleteBook = api.book.delete.useMutation({
    onSuccess: () => {
      void utils.book.invalidate();
    },
  });
  const unfavoriteBook = api.book.unfavorite.useMutation({
    onMutate: async () => {
      await utils.book.isFavorite.cancel();
      const previousFavorite = utils.book.isFavorite.getData();
      utils.book.isFavorite.setData({ id: bookId }, false);
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
      utils.book.isFavorite.setData({ id: bookId }, true);
      return { previousFavorite };
    },
    onSettled: () => {
      void utils.book.invalidate();
    },
  });
  const {
    register,
    setValue,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      title: book?.title || "",
      description: book?.description || "",
    },
  });
  const isChapterCreatable = useMemo(() => {
    if (!book) return false;
    if (!book.isOwner) return false;
    const validBookStatus = [BookStatus.DRAFT, BookStatus.PUBLISHED];
    return validBookStatus.includes(book.status);
  }, [book]);
  const totalViews = useMemo(() => {
    if (book) {
      return book.chapters.reduce((acc, curr) => acc + curr._count.views, 0);
    } else {
      return 0;
    }
  }, [book]);
  const totalLikes = useMemo(() => {
    if (book) {
      return book.chapters.reduce((acc, curr) => acc + curr._count.likes, 0);
    } else {
      return 0;
    }
  }, [book]);

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
    if (
      collaborators &&
      collaborators.some(
        (collaborator) => collaborator.status === BookOwnerStatus.INVITEE
      )
    ) {
      setOpenWarning(true);
    } else {
      void confirmDraftBookHandler();
    }
  };

  const publishBookHandler = async () => {
    const promiseMoveState = moveState.mutateAsync({
      id: bookId,
      status: BookStatus.PUBLISHED,
    });
    await toast.promise(promiseMoveState, {
      loading: "Publishing book...",
      success: "Your book is now published!",
      error: "Error occured during publish",
    });
  };

  const completeBookHandler = async () => {
    const promiseMoveState = moveState.mutateAsync({
      id: bookId,
      status: BookStatus.COMPLETED,
    });
    await toast.promise(promiseMoveState, {
      loading: "Completing book...",
      success: "Your book is now completed!",
      error: "Error occured during completed",
    });
  };

  const archiveBookHandler = async () => {
    const promiseMoveState = moveState.mutateAsync({
      id: bookId,
      status: BookStatus.ARCHIVED,
    });
    await toast.promise(promiseMoveState, {
      loading: "Archive book...",
      success: "Your book is now archived!",
      error: "Error occured during archive",
    });
    void router.push(`/${penname}/book`);
  };

  const deleteBookHandler = async () => {
    const promiseDeleteBook = deleteBook.mutateAsync({ id: bookId });
    await toast.promise(promiseDeleteBook, {
      loading: "Deleting book...",
      success: "Your book is now deleted!",
      error: "Error occured during deleting",
    });
    void router.push(`/${penname}/book`);
  };

  const toggleCategoryHandler = (category: Category) => {
    if (addedCategories.includes(category)) {
      setAddedCategories(addedCategories.filter((data) => data !== category));
    } else {
      setAddedCategories([...addedCategories, category]);
    }
  };

  const toggleFavoriteHandler = () => {
    if (isFavorite) {
      unfavoriteBook.mutate({ id: bookId });
    } else {
      favoriteBook.mutate({ id: bookId });
    }
  };

  const resetHandler = () => {
    setIsEdit(false);
    setValue("title", book?.title || "");
    setValue("description", book?.description || "");
    resetBookCover();
    resetBookWallpaper();
    setAddedCategories(book?.categories.map((data) => data.category) || []);
    setArrangedChapters(
      book?.chapters.sort((x, y) => {
        if (!x.chapterNo || !y.chapterNo) {
          if (!x.publishedAt || !y.publishedAt) return 0;
          return x.publishedAt?.getTime() - y.publishedAt?.getTime();
        }
        return x.chapterNo - y.chapterNo;
      }) || []
    );
  };

  const onSaveHandler = handleSubmit(async (data) => {
    if (book === undefined) return;
    const { title, description } = data;
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
      chaptersArrangement: arrangedChapters.map((chapter) => chapter.id),
    });
    await toast.promise(promiseUpdateBook, {
      loading: "Updating book...",
      success: "Book updated!",
      error: "Error occured during update",
    });
  });

  if (isBookFetched && !book) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <h2 className="text-3xl font-bold">Book not found</h2>
        <p className="text-lg font-light">Please check the url</p>
      </div>
    );
  }

  return (
    <div className="flex w-full items-center justify-center px-6">
      <DialogLayout
        isOpen={openWarning}
        closeModal={() => setOpenWarning(false)}
        title="Are you sure you want to start writing now?"
        description="Not every authors has responsed to your invitation yet."
        onClick={() => void confirmDraftBookHandler()}
        button
      />
      {book && (
        <form
          id="submit-changes"
          onSubmit={(e) => void onSaveHandler(e)}
          className="relative my-8 flex w-full  flex-col gap-8 rounded-xl bg-white px-7 pt-8 shadow-lg"
        >
          <div className="absolute inset-0 h-72 w-full overflow-hidden rounded-lg rounded-tl-large">
            {book?.wallpaperImage || bookWallpaper ? (
              <Image
                src={
                  bookWallpaper
                    ? bookWallpaper
                    : (book.wallpaperImage as string)
                }
                alt="book's wallpaper image"
                height={200}
                width={2000}
              />
            ) : (
              <div className="h-full w-full bg-authGreen-400" />
            )}
            <div className="absolute inset-0 z-10 h-72 w-full bg-gradient-to-t from-white" />
          </div>
          <HiOutlineChevronLeft
            type="button"
            onClick={() => router.back()}
            className="absolute left-2 top-2 z-10 h-8 w-8 cursor-pointer rounded-full border border-gray-500 bg-gray-200 p-1 hover:bg-gray-400"
          />
          <div className="z-10 mt-10 flex gap-7 pb-5 pt-12">
            <div className="ml-7 flex flex-col">
              <div className="flex">
                <div className="h-52 w-3 rounded-r-lg bg-authGreen-600 shadow-lg" />
                <div className="w-36 rounded-l-lg bg-white shadow-lg">
                  <div className="relative h-full w-full overflow-hidden rounded-tl-lg">
                    {isEdit && (
                      <label htmlFor="BookCover">
                        <input
                          id="BookCover"
                          type="file"
                          accept="image/png, image/jpeg"
                          name="BookCover"
                          className="hidden"
                          onChange={setBookCover}
                        />
                        <HiPhoto className="absolute bottom-2 right-2 z-10 w-8 cursor-pointer rounded-md bg-gray-100" />
                      </label>
                    )}
                    {book?.coverImage || bookCover ? (
                      <div className="absolute h-52 w-36 overflow-hidden">
                        <Image
                          src={
                            bookCover ? bookCover : (book.coverImage as string)
                          }
                          alt="book's cover image"
                          width={144}
                          height={208}
                        />
                      </div>
                    ) : (
                      <div className="h-full w-full bg-authGreen-400" />
                    )}
                    {!book.isOwner && status === "authenticated" && (
                      <button type="button" onClick={toggleFavoriteHandler}>
                        {!isFavorite ? (
                          <HiOutlineStar className="absolute bottom-0 right-0 h-10 w-10 text-yellow-400 hover:text-yellow-500" />
                        ) : (
                          <HiStar className="absolute bottom-0 right-0 h-10 w-10 text-yellow-400 hover:text-yellow-500" />
                        )}
                      </button>
                    )}
                    {book.isOwner && !isEdit && (
                      <button
                        type="button"
                        onClick={() =>
                          void router.push(`/${penname}/book/${bookId}/status`)
                        }
                        className="absolute bottom-1 right-1 rounded-full bg-gray-400 px-2 py-1 text-xs text-white hover:bg-gray-500"
                      >
                        View status
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-8 gap-1">
                <div className="mb-3 flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-black">Author:</p>
                    {book.owners.map((author) => (
                      <div
                        key={author.user.id}
                        onClick={() =>
                          void router.push(`/${author.user.penname as string}`)
                        }
                        className="cursor-pointer rounded-full bg-authGreen-500 px-2 py-0.5 text-xs font-semibold text-white hover:bg-authGreen-600"
                      >
                        {author.user.penname}
                      </div>
                    ))}
                  </div>
                  {isEdit && (
                    <div className="flex flex-col-reverse gap-2">
                      <div className="flex flex-col items-start gap-2 overflow-x-auto rounded-xl">
                        {addedCategories.length === 0 && (
                          <div className="h-5" />
                        )}
                        {addedCategories.map((category) => (
                          <span
                            key={category.id}
                            onClick={() => toggleCategoryHandler(category)}
                            className="cursor-pointer select-none whitespace-nowrap rounded-full bg-authYellow-500 px-2 py-0.5 text-xs text-white hover:bg-red-600"
                          >
                            {category.title}
                          </span>
                        ))}
                      </div>
                      {categories && (
                        <Popover className="relative">
                          <Popover.Panel className="absolute left-32 top-0 z-20">
                            <div className="grid w-max grid-cols-2 gap-2 rounded-xl bg-gray-200 p-2">
                              {categories
                                .filter(
                                  (category: Category) =>
                                    !addedCategories.includes(category)
                                )
                                .map((category) => (
                                  <button
                                    type="button"
                                    key={category.id}
                                    onClick={() =>
                                      toggleCategoryHandler(category)
                                    }
                                    className="flex w-36 items-center justify-center rounded-lg bg-white p-2 text-xs font-bold shadow-md hover:bg-gray-300"
                                  >
                                    {category.title}
                                  </button>
                                ))}
                              {categories.filter(
                                (category: Category) =>
                                  !addedCategories.includes(category)
                              ).length === 0 && (
                                <p className="text-sm font-semibold">
                                  No more categories left...
                                </p>
                              )}
                            </div>
                          </Popover.Panel>
                          <Popover.Button
                            className="rounded-lg border border-authGreen-400 px-3 py-2 text-sm font-semibold text-authGreen-500 hover:border-authGreen-600 hover:bg-authGreen-600 hover:text-white"
                            type="button"
                          >
                            Add categories
                          </Popover.Button>
                        </Popover>
                      )}
                    </div>
                  )}
                </div>
                {!isEdit && (
                  <div>
                    <div className="flex flex-col gap-4">
                      {book.status === BookStatus.INITIAL && (
                        <button
                          type="button"
                          onClick={() => void draftBookHandler()}
                          className="h-8 w-32 rounded-md bg-gradient-to-b from-authBlue-500 to-authBlue-600 text-sm font-semibold text-white hover:bg-gradient-to-b hover:from-authBlue-600 hover:to-authBlue-700"
                        >
                          Start Writing
                        </button>
                      )}
                      {book.status === BookStatus.DRAFT && (
                        <button
                          type="button"
                          onClick={() => void publishBookHandler()}
                          className="h-8 w-32 rounded-lg bg-gradient-to-b from-green-400 to-green-500 text-sm font-semibold text-white hover:bg-gradient-to-b hover:from-green-500 hover:to-green-600"
                        >
                          Publish
                        </button>
                      )}
                      {book.status === BookStatus.PUBLISHED && (
                        <button
                          type="button"
                          onClick={() => void completeBookHandler()}
                          className="h-8 w-32 rounded-lg bg-gradient-to-b from-gray-400 to-gray-500 text-sm font-semibold text-white hover:bg-gradient-to-b hover:from-gray-500 hover:to-gray-600"
                        >
                          Complete
                        </button>
                      )}
                      {(book.status === BookStatus.INITIAL ||
                        book.status === BookStatus.DRAFT) && (
                        <button
                          type="button"
                          onClick={() => void deleteBookHandler()}
                          className="h-8 w-32 rounded-lg bg-gradient-to-b from-red-400 to-red-500 text-sm font-semibold text-white hover:bg-gradient-to-b hover:from-red-500 hover:to-red-600"
                        >
                          Delete
                        </button>
                      )}
                      {(book.status === BookStatus.PUBLISHED ||
                        book.status === BookStatus.COMPLETED) && (
                        <button
                          type="button"
                          onClick={() => void archiveBookHandler()}
                          className="h-8 w-32 rounded-lg bg-gradient-to-b from-red-400 to-red-500 text-sm font-semibold text-white hover:bg-gradient-to-b hover:from-red-500 hover:to-red-600"
                        >
                          Archive
                        </button>
                      )}
                    </div>
                    <div className="my-10 flex flex-col gap-1">
                      <span className="text-6xl font-bold">12</span>
                      <p className="text-xl font-bold text-authGreen-600">
                        chapters
                      </p>
                    </div>
                    <div className="flex gap-8">
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-xl font-bold text-authGreen-600">
                          {totalViews}
                        </p>
                        <HiEye className="h-5 w-5 text-authGreen-600" />
                      </div>
                      <div className="flex  flex-col items-center gap-2">
                        <p className="text-xl font-bold text-authGreen-600">
                          {totalLikes}
                        </p>
                        <HiHeart className="h-5 w-5 text-authGreen-600" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex grow flex-col">
              <div
                className={`
                ${
                  isEdit ? "justify-end gap-2" : "justify-center"
                } ${"flex h-52 flex-col gap-2"}`}
              >
                {!isEdit && (
                  <div className="flex max-w-2xl flex-wrap gap-2 ">
                    {book.categories.map((c) => (
                      <div
                        key={c.category.id}
                        onClick={() =>
                          void router.push(`/category/${c.category.title}`)
                        }
                        className="cursor-pointer rounded-full bg-authGreen-500 px-3 text-xs font-light text-white hover:bg-authGreen-600"
                      >
                        {c.category.title}
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-4">
                  {isEdit ? (
                    <div className="flex flex-col gap-4">
                      <label htmlFor="BookWallpaper">
                        <input
                          id="BookWallpaper"
                          type="file"
                          accept="image/png, image/jpeg"
                          name="BookWallpaper"
                          className="hidden"
                          onChange={setBookWallpaper}
                        />
                        <HiPhoto className="w-8 cursor-pointer rounded-md bg-gray-100" />
                      </label>
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
                          className={`${"text-xs"} 
                          ${
                            watch("title") && watch("title").length > 100
                              ? "text-red-500"
                              : "text-black"
                          }`}
                        >
                          {watch("title") ? watch("title").length : 0}/100
                        </p>
                      </div>
                      {errors.title && (
                        <p className="text-xs text-red-400" role="alert">
                          {errors.title.message}
                        </p>
                      )}
                    </div>
                  ) : (
                    <h1 className="text-3xl font-bold">{book.title}</h1>
                  )}
                  <EditButton
                    isEdit={isEdit}
                    onEdit={() => setIsEdit(true)}
                    isOwner={book.isOwner}
                    reset={resetHandler}
                  />
                </div>
                {isEdit ? (
                  <div>
                    <div className="flex items-end gap-2">
                      <TextareaAutoSize
                        minRows={2}
                        id="description"
                        className="focus:shadow-outline h-24 w-96 resize-none rounded-lg border bg-gray-300 px-3 py-2 text-sm text-black placeholder:text-gray-400 focus:outline-none"
                        placeholder={
                          book.description || "write the description down..."
                        }
                        {...register("description")}
                      />
                      <p
                        className={`${"text-xs"} 
                          ${
                            watch("description") &&
                            watch("description").length > 500
                              ? "text-red-500"
                              : "text-black"
                          }`}
                      >
                        {watch("description") ? watch("description").length : 0}
                        /500
                      </p>
                    </div>
                    {errors.description && (
                      <p className="text-xs text-red-400" role="alert">
                        {errors.description.message}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="w-96 text-sm font-light">{book.description}</p>
                )}
              </div>
              <div className="flex gap-2 self-end">
                <InfomationButton
                  openModal={() => setOpenInformation(true)}
                  isOpen={openInformation}
                  closeModal={() => setOpenInformation(false)}
                  title={"Rearrange Chapters"}
                  color="gray-400"
                  hoverColor="gray-200"
                >
                  <BookManagementInformation />
                </InfomationButton>
              </div>
              <div className="mt-3 min-h-[400px] rounded-sm bg-authGreen-300 shadow-lg">
                {book.chapters && (
                  <DndProvider
                    key={book.updatedAt.toString()}
                    backend={HTML5Backend}
                  >
                    <ChapterCardList
                      isEdit={isEdit}
                      isChapterCreatable={isChapterCreatable}
                      chapters={book.chapters}
                    />
                  </DndProvider>
                )}
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default BookContent;
