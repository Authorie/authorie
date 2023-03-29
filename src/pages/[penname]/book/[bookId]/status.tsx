import { CategoryPopover } from "@components/action/CategoryPopover";
import { EditButton } from "@components/action/EditButton";
import AuthorList from "@components/Book/AuthorList";
import BookCoverEditable from "@components/Book/BookCoverEditable";
import { ChevronLeftIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import useImageUpload from "@hooks/imageUpload";
import type { Category } from "@prisma/client";
import { BookOwnerStatus, BookStatus } from "@prisma/client";
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
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import superjson from "superjson";
import * as z from "zod";

const validationSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Title is required" })
    .max(100, { message: "Title is too long" }),
  description: z.string().max(500, { message: "Description is too long" }),
  author: z.string(),
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
  const penname = context.query.penname as string;
  const bookId = context.query.bookId as string;
  await ssg.book.getData.prefetch({ id: bookId });
  await ssg.category.getAll.prefetch();
  await ssg.user.getBookCollaborators.prefetch({ bookId: bookId });
  return {
    props: {
      trpcState: ssg.dehydrate(),
      session,
      bookId,
      penname,
    },
  };
};

type props = InferGetServerSidePropsType<typeof getServerSideProps>;

const StatusPage = ({ bookId, penname }: props) => {
  const [isEdit, setIsEdit] = useState(false);
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
  const router = useRouter();
  const utils = api.useContext();
  const { data: categories } = api.category.getAll.useQuery();
  const { data: collaborators } = api.user.getBookCollaborators.useQuery({
    bookId: bookId,
  });
  const { data: book } = api.book.getData.useQuery({ id: bookId });
  const [addedCategories, setAddedCategories] = useState<Category[]>(
    book?.categories ? book?.categories.map((data) => data.category) : []
  );
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
  const [newCollaborator, setNewCollaborator] = useState(watch("author"));
  const {
    data: newUserInvite,
    refetch,
    isLoading: isLoadingNewUser,
  } = api.user.getData.useQuery(newCollaborator, {
    enabled: false,
  });
  useEffect(() => {
    setNewCollaborator(watch("author"));
  }, [watch("author")]);

  const deleteBook = api.book.delete.useMutation({
    onSuccess: () => {
      void utils.book.invalidate();
    },
  });
  const removeCollaborator = api.user.removeCollaborationInvite.useMutation({
    async onMutate(removedCollaborator) {
      await utils.user.getBookCollaborators.cancel();
      const prevCollaborators = utils.user.getBookCollaborators.getData({
        bookId: bookId,
      });
      if (!prevCollaborators) return;
      const collabIndex = prevCollaborators.findIndex(
        (prev) => prev.userId === removedCollaborator.userId
      );
      const collaborator = prevCollaborators.splice(collabIndex, 1);
      utils.user.getBookCollaborators.setData({ bookId: bookId }, collaborator);
      return { prevCollaborators };
    },
    onSuccess() {
      void utils.book.invalidate();
    },
    onSettled: () => {
      void utils.book.invalidate();
    },
  });
  const inviteCollaborator = api.user.inviteCollaborator.useMutation({
    async onMutate(newCollaborator) {
      await utils.user.getBookCollaborators.cancel();
      const prevCollaborators = utils.user.getBookCollaborators.getData({
        bookId: bookId,
      });
      if (!prevCollaborators) return;
      const collaborator = {
        ...prevCollaborators,
        user: {
          id: newCollaborator.userId,
          penname: newUserInvite?.penname,
          image: newUserInvite?.image,
        },
      };
      utils.user.getBookCollaborators.setData({ bookId: bookId }, collaborator);
      return { prevCollaborators };
    },
    onError: () => {
      void utils.book.invalidate();
    },
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

  const draftBookHandler = async () => {
    if (book === undefined) return;
    try {
      const promiseMoveState = moveState.mutateAsync({
        id: book?.id,
        status: BookStatus.DRAFT,
      });
      await toast.promise(promiseMoveState, {
        loading: "Move to draft state...",
        success: "Your book is in draft state now!",
        error: "Error occured during move state",
      });
    } catch (err) {
      toast("Error occured during move state");
    }
  };

  const publishBookHandler = async () => {
    if (book === undefined) return;
    try {
      const promiseMoveState = moveState.mutateAsync({
        id: book?.id,
        status: BookStatus.PUBLISHED,
      });
      await toast.promise(promiseMoveState, {
        loading: "Publishing book...",
        success: "Your book is now published!",
        error: "Error occured during publish",
      });
    } catch (err) {
      toast("Error occured during publish");
    }
  };

  const completeBookHandler = async () => {
    if (book === undefined) return;
    try {
      const promiseMoveState = moveState.mutateAsync({
        id: book?.id,
        status: BookStatus.COMPLETED,
      });
      await toast.promise(promiseMoveState, {
        loading: "Completing book...",
        success: "Your book is now completed!",
        error: "Error occured during completed",
      });
    } catch (err) {
      toast("Error occured during completed");
    }
  };

  const archiveBookHandler = async () => {
    if (book === undefined) return;
    try {
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
    } catch (err) {
      toast("Error occured during archive");
    }
  };

  const deleteBookHandler = async () => {
    if (book === undefined) return;
    try {
      const promiseDeleteBook = deleteBook.mutateAsync({ id: book?.id });
      await toast.promise(promiseDeleteBook, {
        loading: "Deleting book...",
        success: "Your book is now deleted!",
        error: "Error occured during deleting",
      });
      void router.push(`/${penname}/book`);
    } catch (err) {
      toast("Error occured during deleting");
    }
  };

  const toggleCategoryHandler = (category: Category) => {
    if (addedCategories.includes(category)) {
      setAddedCategories(addedCategories.filter((data) => data !== category));
    } else {
      setAddedCategories([...addedCategories, category]);
    }
  };

  useEffect(() => {
    const mutateInviteCollaborator = async () => {
      try {
        if (newUserInvite) {
          const promiseInvite = inviteCollaborator.mutateAsync({
            userId: newUserInvite.id,
            bookId: bookId,
          });
          await toast.promise(promiseInvite, {
            loading: `Inviting ${newUserInvite?.penname as string}...`,
            success: "Invited!",
            error: `Error occured while inviting ${
              newUserInvite?.penname as string
            }`,
          });
        }
      } catch (err) {
        toast("Error occured while inviting");
      }
    };
    if (!isLoadingNewUser) {
      void mutateInviteCollaborator();
    }
  }, [isLoadingNewUser]);

  const inviteCollaboratorHandler = async () => {
    await refetch();
  };

  const removeCollaboratorHandler = async (
    userId: string,
    userPenname: string
  ) => {
    try {
      const promiseRemove = removeCollaborator.mutateAsync({
        userId: userId,
        bookId: bookId,
      });
      await toast.promise(promiseRemove, {
        loading: `Removing ${userPenname}...`,
        success: `Successful removed ${userPenname}!`,
        error: `Error occured while removing ${userPenname}`,
      });
    } catch (err) {
      toast("Error occured while removing");
    }
  };

  const inviteAgainHandler = async (userPenname: string) => {
    setNewCollaborator(userPenname);
    await refetch();
  };

  const resetHandler = () => {
    setIsEdit(false);
    reset((formValues) => ({
      ...formValues,
      title: book?.title as string,
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
      <div className="relative m-8 overflow-hidden rounded-xl bg-white">
        <div
          onClick={() => router.back()}
          className="absolute inset-0 left-2 top-2 z-10 w-fit"
        >
          <ChevronLeftIcon className="h-8 w-8 cursor-pointer rounded-full border border-gray-500 bg-gray-200 p-1 hover:bg-gray-400" />
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
                    src={
                      bookWallpaper
                        ? bookWallpaper
                        : (book.wallpaperImage as string)
                    }
                    alt={`${book.title}'s wallpaper image`}
                    fill
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
                          <PhotoIcon className="w-8 cursor-pointer rounded-md bg-gray-100" />
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
                      <h1 className="text-2xl font-bold">
                        Book Status:{" "}
                        <span className="text-yellow-600">{book.status}</span>
                      </h1>
                      <div className="flex gap-3">
                        {!isEdit ? (
                          <h1 className="text-3xl font-bold">{book.title}</h1>
                        ) : (
                          <div className="flex flex-col">
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
                            <textarea
                              rows={2}
                              id="description"
                              className="focus:shadow-outline h-24 w-96 resize-none rounded-lg border bg-gray-300 px-3 py-2 text-sm text-black placeholder:text-gray-400 focus:outline-none"
                              placeholder={
                                book.description ||
                                "write the description down..."
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
                              {watch("description")
                                ? watch("description").length
                                : 0}
                              /500
                            </p>
                          </div>
                          {errors.description && (
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
                    <div className="mt-6 flex w-fit flex-col self-center rounded-lg p-4">
                      <div className="flex items-center justify-center">
                        <h1 className="text-xl font-bold">Author List</h1>
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
                            onClick={() => void inviteCollaboratorHandler()}
                            className="rounded-lg bg-blue-500 px-4 py-1 text-white hover:bg-blue-600"
                          >
                            Invite
                          </button>
                        </div>
                      )}
                      <div className="flex justify-center gap-48 text-lg font-semibold">
                        <p>Author</p>
                        <p>Status</p>
                      </div>
                      <ol className="divide-y-2 self-center">
                        {collaborators && collaborators.length > 1 ? (
                          collaborators.map(
                            (author, index) =>
                              author.status !== BookOwnerStatus.OWNER && (
                                <AuthorList
                                  key={index}
                                  number={index + 1}
                                  penname={author.user.penname as string}
                                  userId={author.userId}
                                  status={author.status}
                                  authorPicture={author.user.image || ""}
                                  bookStatus={book.status}
                                  onInvite={(penname) =>
                                    void inviteAgainHandler(penname)
                                  }
                                  onRemove={(id, penname) =>
                                    void removeCollaboratorHandler(id, penname)
                                  }
                                />
                              )
                          )
                        ) : (
                          <div className="mt-10 flex items-center justify-center">
                            <p>No collaborators</p>
                          </div>
                        )}
                      </ol>
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
};

export default StatusPage;
