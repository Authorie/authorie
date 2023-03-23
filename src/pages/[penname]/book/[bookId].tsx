import { useState } from "react";
import { StarIcon } from "@heroicons/react/24/outline";
import {
  StarIcon as StarIconSolid,
  PhotoIcon,
} from "@heroicons/react/24/solid";
import ChapterCard from "@components/Chapter/ChapterCard";
import {
  ChevronLeftIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import {
  Bars3CenterLeftIcon,
  EyeIcon,
  HeartIcon,
} from "@heroicons/react/24/solid";
import Image from "next/image";
import { useRouter } from "next/router";
import { api } from "@utils/api";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { getServerAuthSession } from "@server/auth";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { createInnerTRPCContext } from "@server/api/trpc";
import { appRouter } from "@server/api/root";
import superjson from "superjson";
import { useMemo } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import useImageUpload from "@hooks/imageUpload";
import { Popover } from "@headlessui/react";
import type { Category } from "@prisma/client";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

const validationSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Title is required" })
    .max(50, { message: "Title is too long" }),
  description: z.string().max(300, { message: "Description is too long" }),
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
  const { data: categories } = api.category.getAll.useQuery();
  const { data: book } = api.book.getData.useQuery({
    id: bookId,
  });
  const [addedCategories, setAddedCategories] = useState<Category[]>(
    book?.categories.map((data) => data.category) || []
  ); // tanstack-query as react state manager
  const [isEdit, setIsEdit] = useState(false);
  const utils = api.useContext();
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
      utils.book.isFavorite.setData({ id: bookId }, (old) => !old);
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
      utils.book.isFavorite.setData({ id: bookId }, (old) => !old);
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
      title: "",
      description: "",
    },
  });
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

  const toggleFavoriteHandler = () => {
    if (isFavorite) {
      unfavoriteBook.mutate({ id: bookId });
    } else {
      favoriteBook.mutate({ id: bookId });
    }
  };
  const updateBook = api.book.update.useMutation({
    onSuccess() {
      void utils.book.invalidate();
      resetHandler();
    },
    onSettled: () => {
      void utils.book.invalidate();
    },
  });
  const uploadImageUrl = api.upload.uploadImage.useMutation();

  const resetHandler = () => {
    reset();
    setIsEdit(false);
    resetBookCover();
    resetBookWallpaper();
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
        onSubmit={(e) => void handleSubmit(onSaveHandler)(e)}
        className="relative mx-14 my-8 flex flex-col gap-8 rounded-xl bg-white px-7 pt-8 shadow-lg"
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
        <div
          onClick={() => router.back()}
          className="absolute inset-0 top-2 left-2 z-10"
        >
          <ChevronLeftIcon className="h-8 w-8 cursor-pointer rounded-full border border-gray-500 bg-gray-200 p-1 hover:bg-gray-400" />
        </div>
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
                            onClick={() =>
                              setAddedCategories((prev) =>
                                prev.filter((c) => c.id !== category.id)
                              )
                            }
                            key={category.id}
                            className="cursor-pointer select-none whitespace-nowrap rounded-full bg-authGreen-500 px-2 py-0.5 text-xs text-white hover:bg-red-600"
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
                                    key={category.id}
                                    type="button"
                                    onClick={() =>
                                      setAddedCategories((prev) => [
                                        ...prev,
                                        category,
                                      ])
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
            <div className="flex flex-col">
              <div
                className={`
                ${
                  isEdit ? "justify-end gap-2" : "justify-center"
                } ${"flex h-52 w-3/5 flex-col gap-2"}`}
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
                          className="focus:shadow-outline w-96 rounded-lg border bg-gray-300 px-3 text-3xl font-bold text-gray-800 placeholder:text-gray-600 focus:outline-none"
                          placeholder={book.title}
                          {...register("title")}
                        />
                        <p
                          className={`${"text-xs"} 
                          ${
                            watch("title") && watch("title").length > 50
                              ? "text-red-500"
                              : "text-black"
                          }`}
                        >
                          {watch("title") ? watch("title").length : 0}/50
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
                  <button
                    type="button"
                    onClick={() => setIsEdit(true)}
                    className="cursor-pointer"
                  >
                    {!isEdit && (
                      <PencilSquareIcon
                        className={`w-7 ${
                          book.isOwner
                            ? " rounded-lg p-1 text-gray-800 hover:bg-gray-400"
                            : "hidden"
                        }`}
                      />
                    )}
                  </button>
                  {isEdit && (
                    <div className="flex items-end gap-3">
                      <button
                        type="button"
                        onClick={resetHandler}
                        className="rounded-xl border-2 bg-red-500 px-5 py-1 text-white hover:bg-red-600 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="rounded-xl border-2 bg-green-500 px-5 py-1 text-white hover:bg-green-600 hover:text-white"
                      >
                        Save
                      </button>
                    </div>
                  )}
                </div>
                {isEdit ? (
                  <div>
                    <div className="flex items-end gap-2">
                      <textarea
                        rows={2}
                        id="description"
                        className="focus:shadow-outline h-24 w-96 resize-none rounded-lg border bg-gray-300 py-2 px-3 text-sm placeholder:text-gray-500 focus:outline-none"
                        placeholder={
                          book.description || "write the description down..."
                        }
                        {...register("description")}
                      />
                      <p
                        className={`${"text-xs"} 
                          ${
                            watch("description") &&
                            watch("description").length > 300
                              ? "text-red-500"
                              : "text-black"
                          }`}
                      >
                        {watch("description") ? watch("description").length : 0}
                        /300
                      </p>
                    </div>
                    {errors.description && (
                      <p className="text-xs text-red-400" role="alert">
                        {errors.description.message}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm font-light">{book.description}</p>
                )}
              </div>
              <div className="flex gap-2 self-end">
                <Bars3CenterLeftIcon className="h-7 w-7 rounded-lg bg-gray-200" />
                <MagnifyingGlassIcon className="h-7 w-7 rounded-lg bg-gray-200" />
              </div>
              <div className="mt-3 flex max-h-fit min-h-[452px] w-[800px] grow justify-center rounded-sm bg-authGreen-300 shadow-lg">
                {book.chapters.length !== 0 && (
                  <div className="grid w-fit grid-cols-2 gap-x-4 gap-y-1 p-4">
                    {book.chapters.map((chapter) => (
                      <ChapterCard key={chapter.id} chapter={chapter} />
                    ))}
                  </div>
                )}
                {book.chapters.length === 0 && (
                  <div className="flex flex-col items-center justify-center gap-5">
                    <p className="text-lg font-semibold text-black">
                      This book does not have any chapters yet.
                    </p>
                    {book.isOwner && (
                      <Link
                        href="/create/chapter"
                        className="rounded-lg bg-green-600 px-3 py-2 text-white hover:bg-green-700"
                      >
                        Create Chapter
                      </Link>
                    )}
                  </div>
                )}
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
