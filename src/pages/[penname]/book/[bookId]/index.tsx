import ChapterCard from "@components/Chapter/ChapterCard";
import { Popover } from "@headlessui/react";
import {
  ChevronLeftIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import {
  Bars3CenterLeftIcon,
  EyeIcon,
  HeartIcon,
  PhotoIcon,
  StarIcon as StarIconSolid,
} from "@heroicons/react/24/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import useImageUpload from "@hooks/imageUpload";
import type { Category } from "@prisma/client";
import { BookStatus } from "@prisma/client";
import { appRouter } from "@server/api/root";
import { createInnerTRPCContext } from "@server/api/trpc";
import { getServerAuthSession } from "@server/auth";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { api } from "@utils/api";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import superjson from "superjson";
import * as z from "zod";
import { EditButton } from "@components/action/EditButton";

const validationSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Title is required" })
    .max(100, { message: "Title is too long" }),
  description: z.string().max(500, { message: "Description is too long" }),
});

type ValidationSchema = z.infer<typeof validationSchema>;

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getServerAuthSession(context);
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: createInnerTRPCContext({ session }),
    transformer: superjson,
  });
  const bookId = context.query.bookId as string;
  await ssg.book.getData.prefetch({ id: bookId });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      session,
      bookId,
    },
  };
};

type props = InferGetServerSidePropsType<typeof getServerSideProps>;

const BookContent = ({ bookId }: props) => {
  const router = useRouter();
  const utils = api.useContext();
  const [isEdit, setIsEdit] = useState(false);
  const { data: categories } = api.category.getAll.useQuery();
  const { data: book } = api.book.getData.useQuery({
    id: bookId,
  });
  const [addedCategories, setAddedCategories] = useState(
    book?.categories.map((data) => data.category) || []
  );
  const { data: isFavorite } = api.book.isFavorite.useQuery({ id: bookId });
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
    reset,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ValidationSchema>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      title: book?.title,
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
      return book.chapters.reduce((acc, curr) => acc + curr.views, 0);
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
  const uploadImageUrl = api.upload.uploadImage.useMutation();

  const resetHandler = () => {
    reset((formValues) => ({
      ...formValues,
      title: book?.title as string,
      description: book?.description || "",
    }));
    setIsEdit(false);
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
              title: `${data.title}'s book cover image`,
              image: bookCover,
            })
          : undefined,
        bookWallpaper
          ? uploadImageUrl.mutateAsync({
              title: `${data.title}'s book wallpaper`,
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
        pending: "Updating book...",
        success: "Book updated!",
      });
    } catch (err) {
      console.error(err);
      toast("Error occured during update");
    }
  };

  return (
    <>
      <form
        id="submit-changes"
        onSubmit={(e) => void handleSubmit(onSaveHandler)(e)}
        className="relative my-8 flex w-5/6 flex-col gap-8 rounded-xl bg-white px-7 pt-8 shadow-lg"
      >
        <div className="absolute inset-0 h-96 w-full overflow-hidden rounded-lg rounded-tl-large">
          {book && (book?.wallpaperImage || bookWallpaper) ? (
            <Image
              src={
                bookWallpaper ? bookWallpaper : (book.wallpaperImage as string)
              }
              alt="book's wallpaper image"
              fill
            />
          ) : (
            <div className="h-full w-full bg-authGreen-400" />
          )}
          <div className="absolute inset-0 z-10 h-96 w-full bg-gradient-to-t from-white" />
        </div>
        <ChevronLeftIcon
          type="button"
          onClick={() => router.back()}
          className="absolute top-2 left-2 z-10 h-8 w-8 cursor-pointer rounded-full border border-gray-500 bg-gray-200 p-1 hover:bg-gray-400"
        />
        {book && (
          <div className="z-10 flex gap-7 pt-10 pb-5">
            <div className="ml-7 flex flex-col">
              <div className="flex">
                <div className="h-52 w-3 rounded-r-lg bg-white shadow-lg" />
                <div className="w-40 rounded-l-lg bg-white shadow-lg">
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
                        <PhotoIcon className="absolute right-2 bottom-2 z-10 w-8 cursor-pointer rounded-md bg-gray-100" />
                      </label>
                    )}
                    {book?.coverImage || bookCover ? (
                      <Image
                        src={
                          bookCover ? bookCover : (book.coverImage as string)
                        }
                        alt="book's cover image"
                        fill
                      />
                    ) : (
                      <div className="h-full w-full bg-authGreen-400" />
                    )}
                    {!book.isOwner && (
                      <button onClick={toggleFavoriteHandler}>
                        {isFavorite ? (
                          <StarIcon className="absolute bottom-0 right-0 h-10 w-10 text-yellow-400 hover:text-yellow-500" />
                        ) : (
                          <StarIconSolid className="absolute bottom-0 right-0 h-10 w-10 text-yellow-400 hover:text-yellow-500" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-8 gap-1">
                <div className="mb-3 flex flex-col gap-3">
                  {book.owners.map((author) => (
                    <h2 key={author.user.id} className="text-xl font-semibold">
                      {author.user.penname}
                    </h2>
                  ))}
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
                          <Popover.Panel className="absolute left-32 top-0 z-10">
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
                            className="rounded-lg border border-authGreen-400 py-2 px-3 text-sm font-semibold text-authGreen-500 hover:border-authGreen-600 hover:bg-authGreen-600 hover:text-white"
                            type="button"
                          >
                            Add categories
                          </Popover.Button>
                        </Popover>
                      )}
                    </div>
                  )}
                  {!isEdit && (
                    <p className="text-sm font-light">
                      {book.categories.map((c) => c.category.title).join(" ")}
                    </p>
                  )}
                </div>
                {!isEdit && (
                  <div>
                    <div className="flex flex-col gap-4">
                      <button className="h-10 w-36 rounded-lg bg-gray-800 font-semibold text-white">
                        Auction book
                      </button>
                      <button className="h-10 w-36 rounded-lg bg-gray-800 font-semibold text-white">
                        Complete book
                      </button>
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
                        <EyeIcon className="h-5 w-5 text-authGreen-600" />
                      </div>
                      <div className="flex  flex-col items-center gap-2">
                        <p className="text-xl font-bold text-authGreen-600">
                          {totalLikes}
                        </p>
                        <HeartIcon className="h-5 w-5 text-authGreen-600" />
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
                        <PhotoIcon className="w-8 cursor-pointer rounded-md bg-gray-100" />
                      </label>
                      <div className="flex items-end gap-2">
                        <input
                          aria-invalid={errors.title ? "true" : "false"}
                          id="title"
                          type="text"
                          className="focus:shadow-outline w-96 rounded-lg border bg-gray-300 px-3 text-3xl font-bold text-black placeholder:text-gray-400 focus:outline-none"
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
                      <textarea
                        rows={2}
                        id="description"
                        className="focus:shadow-outline h-24 w-96 resize-none rounded-lg border bg-gray-300 py-2 px-3 text-sm text-black placeholder:text-gray-400 focus:outline-none"
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
                <Bars3CenterLeftIcon className="h-7 w-7 rounded-lg bg-gray-200" />
                <MagnifyingGlassIcon className="h-7 w-7 rounded-lg bg-gray-200" />
              </div>
              <div className="mt-3 min-h-[400px] rounded-sm bg-authGreen-300 shadow-lg">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 p-4">
                  {isChapterCreatable && (
                    <div className="flex h-16 w-full cursor-pointer items-center justify-center gap-4 rounded-lg bg-gray-200 p-3 shadow-lg transition duration-100 ease-in-out hover:-translate-y-1 hover:scale-[1.01]">
                      <PlusCircleIcon className="w-8" />
                      <span className="text-lg font-semibold">
                        Create new chapter
                      </span>
                    </div>
                  )}
                  {book.chapters.length === 0 && !isChapterCreatable && (
                    <div className="flex h-16 w-full cursor-pointer items-center justify-center rounded-lg bg-white p-3 shadow-lg">
                      <span className="text-lg font-semibold">
                        This book has no chapters yet
                      </span>
                    </div>
                  )}
                  {book.chapters.map((chapter) => (
                    <ChapterCard key={chapter.id} chapter={chapter} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
      <ToastContainer />
    </>
  );
};

export default BookContent;