import { Popover } from "@headlessui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Category } from "@prisma/client";
import { BookOwnerStatus, BookStatus } from "@prisma/client";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  HiEye,
  HiHeart,
  HiOutlineChevronLeft,
  HiOutlineStar,
  HiPhoto,
  HiStar,
} from "react-icons/hi2";
import TextareaAutoSize from "react-textarea-autosize";
import z from "zod";

import ChapterCardList from "~/components/Chapter/ChapterCardList";
import DialogLayout from "~/components/Dialog/DialogLayout";
import BookManagementInformation from "~/components/Information/BookManagementInformation";
import InformationButton from "~/components/Information/InformationButton";
import { EditButton } from "~/components/action/EditButton";
import useImageUpload from "~/hooks/imageUpload";
import { api, type RouterOutputs } from "~/utils/api";

const validationSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Title is required" })
    .max(100, { message: "Title is too long" }),
  description: z.string().max(500, { message: "Description is too long" }),
});

interface withChapterNo {
  chapterNo: number | null;
}

const sortChapters = (a: withChapterNo, b: withChapterNo) => {
  return (b.chapterNo ?? 0) - (a.chapterNo ?? 0);
};

type props = {
  penname: string;
  book: RouterOutputs["book"]["getData"];
  categories: RouterOutputs["category"]["getAll"];
};

const BookContent = ({ penname, book, categories }: props) => {
  const router = useRouter();
  const utils = api.useContext();
  const { status } = useSession();
  const [isEdit, setIsEdit] = useState(false);
  const [openWarning, setOpenWarning] = useState(false);
  const [openInformation, setOpenInformation] = useState(false);
  const [addedCategories, setAddedCategories] = useState<Category[]>(
    book.categories.map(({ category }) => category)
  );
  const [arrangedChapters, setArrangedChapters] = useState<
    RouterOutputs["book"]["getData"]["chapters"]
  >(book.chapters.sort(sortChapters));

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
              ? variables.chaptersArrangement.map((chapterId, index) => {
                return {
                  ...old.chapters.find(
                    (chapter) => chapter.id === chapterId
                  )!,
                  chapterNo: index + 1,
                };
              })
              : old.chapters,
            updatedAt: dayjs().toDate(),
          }
          : undefined
      );
      return { prevData };
    },
    onSettled(_data, error, variables, context) {
      if (error) {
        utils.book.getData.setData({ id: variables.id }, context?.prevData);
      }
      void utils.book.getData.invalidate({ id: variables.id });
      resetHandler();
    },
  });
  const moveState = api.book.moveState.useMutation({
    onSettled(_data, _error, variables, _context) {
      void utils.book.getData.invalidate(variables);
    },
  });
  const deleteBook = api.book.delete.useMutation({
    onSettled(_data, _error, variables, _context) {
      void utils.book.getData.invalidate(variables);
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
    onError(_error, variables, context) {
      utils.book.getData.setData(variables, context?.previousBook);
    },
    onSettled(_data, _error, variables, _context) {
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
  const {
    register,
    setValue,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      title: book.title,
      description: book.description ?? "",
    },
  });
  const isChapterCreatable = () => {
    if (!book.isOwner && !book.isCollborator) return false;
    const validBookStatus = [BookStatus.DRAFT, BookStatus.PUBLISHED];
    return validBookStatus.includes(book.status);
  };
  const totalViews = book.chapters.reduce(
    (acc, curr) => acc + curr._count.views,
    0
  );
  const totalLikes = book.chapters.reduce(
    (acc, curr) => acc + curr._count.likes,
    0
  );

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
      setOpenWarning(true);
    } else {
      void confirmDraftBookHandler();
    }
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

  const archiveBookHandler = async () => {
    if (book.chapters.some((chapter) => chapter.publishedAt === null)) {
      toast.error("You have to publish all chapters before complete book");
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

  const deleteBookHandler = async () => {
    const promiseDeleteBook = deleteBook.mutateAsync({ id: book.id });
    await toast.promise(promiseDeleteBook, {
      loading: "Deleting book...",
      success: "Your book is now deleted!",
      error: "Error occured during deleting",
    });
    void router.push(`/${penname}/book`);
  };

  const toggleCategoryHandler = (category: { id: string; title: string }) => {
    setAddedCategories((addedCategories) => {
      if (addedCategories.includes(category)) {
        return addedCategories.filter((data) => data !== category);
      } else {
        return [...addedCategories, category];
      }
    });
  };

  const toggleFavoriteHandler = () => {
    if (book.isFavorite) {
      unfavoriteBook.mutate({ id: book.id });
    } else {
      favoriteBook.mutate({ id: book.id });
    }
  };

  const resetHandler = () => {
    if (book === undefined) return;
    setIsEdit(false);
    setValue("title", book.title);
    setValue("description", book.description || "");
    resetBookCover();
    resetBookWallpaper();
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
      chaptersArrangement: arrangedChapters
        .filter((chapter) => chapter.publishedAt)
        .map((chapter) => chapter.id)
        .reverse(), // need reverse since the order is from the latest,
    });
    await toast.promise(promiseUpdateBook, {
      loading: "Updating book...",
      success: "Book updated!",
      error: "Error occured during update",
    });
  });

  return (
    <>
      <DialogLayout
        button
        isOpen={openWarning}
        closeModal={() => setOpenWarning(false)}
        title="Are you sure you want to start writing now?"
        description="Not every authors has responsed to your invitation yet."
        onClick={() => void confirmDraftBookHandler()}
      />
      <form
        id="submit-changes"
        onSubmit={(e) => void onSaveHandler(e)}
        className="relative flex w-full flex-col gap-8 rounded-xl bg-white px-7 pt-8 shadow-lg"
      >
        <div className="absolute inset-0 h-72 w-full overflow-hidden rounded-lg rounded-tl-large">
          {book.wallpaperImage || bookWallpaper ? (
            <Image
              src={bookWallpaper ? bookWallpaper : book.wallpaperImage!}
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
                  {book.coverImage || bookCover ? (
                    <div className="absolute h-52 w-36 overflow-hidden">
                      <Image
                        src={bookCover ? bookCover : book.coverImage!}
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
                      {!book.isFavorite ? (
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
                        void router.push(`/${penname}/book/${book.id}/status`)
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
                  {book.owners
                    .filter(
                      ({ status }) =>
                        status === BookOwnerStatus.OWNER ||
                        status === BookOwnerStatus.COLLABORATOR
                    )
                    .map(({ user }) => (
                      <div
                        key={user.id}
                        onClick={() => void router.push(`/${user.penname!}`)}
                        className="cursor-pointer rounded-full bg-authGreen-500 px-2 py-0.5 text-xs font-semibold text-white hover:bg-authGreen-600"
                      >
                        {user.penname}
                      </div>
                    ))}
                </div>
                {isEdit && (
                  <div className="flex flex-col-reverse gap-2">
                    <div className="flex flex-col items-start gap-2 overflow-x-auto rounded-xl">
                      {addedCategories.length === 0 && <div className="h-5" />}
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
                  {book.isOwner && (
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
                  )}
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
          ${isEdit ? "justify-end gap-2" : "justify-center"
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
                    ${watch("title") && watch("title").length > 100
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
                    ${watch("description") && watch("description").length > 500
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
              <InformationButton
                openModal={() => setOpenInformation(true)}
                isOpen={openInformation}
                closeModal={() => setOpenInformation(false)}
                title={"Rearrange Chapters"}
                color="gray-400"
                hoverColor="gray-200"
              >
                <BookManagementInformation />
              </InformationButton>
            </div>
            <div className="mt-3 min-h-[400px] rounded-sm bg-authGreen-300 shadow-lg">
              {book.chapters && (
                <DndProvider
                  key={book.updatedAt.toString()}
                  backend={HTML5Backend}
                >
                  <ChapterCardList
                    bookId={book.id}
                    isEdit={isEdit}
                    isChapterCreatable={isChapterCreatable()}
                    arrangedChapters={arrangedChapters}
                    setArrangedChapters={setArrangedChapters}
                  />
                </DndProvider>
              )}
            </div>
          </div>
        </div>
      </form>
    </>
  );
};
export default BookContent;
