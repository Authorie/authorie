import { Popover } from "@headlessui/react";
import { PhotoIcon, PlusIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Category } from "@prisma/client";
import { api } from "@utils/api";
import { useSession } from "next-auth/react";
import Image from "next/legacy/image";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import * as z from "zod";
import useImageUpload from "@hooks/imageUpload";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

const validationSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Title is required" })
    .max(100, { message: "Title is too long" }),
  description: z.string().max(500, { message: "Description is too long" }),
});

type ValidationSchema = z.infer<typeof validationSchema>;

const CreateBook = () => {
  const { imageData: bookCover, uploadHandler: setBookCover } =
    useImageUpload();
  const { imageData: bookWallpaper, uploadHandler: setBookWallpaper } =
    useImageUpload();
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      void router.push("/auth/signin");
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
  });
  const utils = api.useContext();
  const { data: categories } = api.category.getAll.useQuery();
  const bookCreateMutation = api.book.create.useMutation({
    onSuccess: async () => {
      await utils.book.invalidate();
    },
  });
  const uploadImageUrl = api.upload.uploadImage.useMutation();
  const [addedCategories, setAddedCategories] = useState<Category[]>([]);
  const onSubmit: SubmitHandler<ValidationSchema> = async (data) => {
    try {
      let bookCoverUrl;
      let wallpaperImageUrl;
      if (bookCover) {
        bookCoverUrl = await uploadImageUrl.mutateAsync({
          title: `${data.title}'s book cover image`,
          image: bookCover,
        });
      }
      if (bookWallpaper) {
        wallpaperImageUrl = await uploadImageUrl.mutateAsync({
          title: `${data.title}'s book cover image`,
          image: bookWallpaper,
        });
      }
      const promiseCreateBook = bookCreateMutation.mutateAsync({
        title: data.title,
        description: data.description,
        categoryIds: addedCategories.map((category) => category.id),
        coverImageUrl: bookCoverUrl ? bookCoverUrl : undefined,
        wallpaperImageUrl: wallpaperImageUrl ? wallpaperImageUrl : undefined,
      });
      await toast.promise(promiseCreateBook, {
        pending: `Creating a book called ${data.title}`,
        success: `Created ${data.title} successfully!`,
      });
      reset();
    } catch (err) {
      toast("Error occured while creating book!");
    }
  };

  return (
    <form
      onSubmit={(e) => void handleSubmit(onSubmit)(e)}
      className="items-center rounded-b-2xl bg-white py-10 px-10"
    >
      <div className="flex flex-col gap-10">
        <div className="relative flex h-[550px] gap-5 rounded-lg bg-gray-100 px-24 pt-24 pb-11 drop-shadow-lg">
          <div className="absolute top-0 left-0 right-0 -z-10 h-72 overflow-hidden rounded-t-lg">
            {bookWallpaper ? (
              <Image src={bookWallpaper} layout="fill" alt="book's wallpaper" />
            ) : (
              <div className="h-full w-full bg-authGreen-500"></div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-100" />
          </div>
          <label
            htmlFor="BookCover"
            className="relative h-72 w-52 cursor-pointer self-end drop-shadow-md"
          >
            <input
              id="BookCover"
              type="file"
              accept="image/png, image/jpeg"
              name="BookCover"
              className="hidden"
              onChange={setBookCover}
            />
            <Image
              src={bookCover ? bookCover : "/placeholder_book_cover.png"}
              alt="dummy-pic"
              width={208}
              height={288}
              className="rounded-md object-cover"
            />
            <PhotoIcon className="absolute right-2 bottom-2 w-8 rounded-md bg-gray-100" />
          </label>
          <div className="flex grow flex-col justify-end gap-2 pt-6">
            <label htmlFor="BookWallpaper" className="relative h-7 w-8">
              <input
                type="file"
                accept="image/png, image/jpeg"
                name="BookWallpaper"
                id="BookWallpaper"
                className="hidden cursor-pointer"
                onChange={setBookWallpaper}
              />
              <PhotoIcon className="w-8 cursor-pointer rounded-md bg-gray-100 px-0.5 drop-shadow-sm" />
            </label>
            <div className="flex items-end gap-2">
              <input
                aria-invalid={errors.title ? "true" : "false"}
                id="title"
                type="text"
                className="focus:shadow-outline bg-transparent text-4xl font-bold text-gray-800 placeholder:text-gray-600 focus:outline-none"
                placeholder="Untitled"
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
            <div className="flex flex-col gap-1 pl-1">
              <div className="flex items-center gap-2">
                <h5 className="text-sm text-gray-500">Author</h5>
                <div className="flex items-center gap-2">
                  <div className="flex w-80 items-center gap-2 overflow-x-auto rounded-xl bg-authGreen-300 px-2 py-1 ">
                    <span className="select-none rounded-full bg-authGreen-600 px-2 py-0.5 text-xs text-white">
                      {session?.user.penname}
                    </span>
                  </div>
                  <Popover className="relative">
                    <Popover.Button
                      className="rounded-full bg-white"
                      type="button"
                    >
                      <div className="flex items-center justify-center rounded-xl bg-authGreen-300 p-1">
                        <div className="flex items-center justify-center rounded-xl bg-gray-100 p-0.5">
                          <PlusIcon className="h-3 w-3 stroke-[3]" />
                        </div>
                      </div>
                      <p className="sr-only">open user list</p>
                    </Popover.Button>
                  </Popover>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <h5 className="text-sm text-gray-500">Category</h5>
                <div className="flex items-center gap-2">
                  <div className="flex w-80 items-center gap-2 overflow-x-auto rounded-xl bg-authYellow-300 px-2 py-1">
                    {addedCategories.length === 0 && <div className="h-5" />}
                    {addedCategories.map((category) => (
                      <span
                        onClick={() =>
                          setAddedCategories((prev) =>
                            prev.filter((c) => c.id !== category.id)
                          )
                        }
                        key={category.id}
                        className="cursor-pointer select-none whitespace-nowrap rounded-full bg-authYellow-500 px-2 py-0.5 text-xs text-white hover:bg-red-600"
                      >
                        {category.title}
                      </span>
                    ))}
                  </div>
                  {categories && (
                    <Popover className="relative">
                      <Popover.Panel className="absolute bottom-0 left-7 z-10">
                        <div className="grid w-max grid-cols-2 gap-2 rounded-xl bg-gray-200 p-2">
                          {categories
                            .filter(
                              (category) => !addedCategories.includes(category)
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
                                className="mb-2 flex w-36 items-center justify-center rounded-lg bg-white p-2 text-xs font-bold shadow-md hover:bg-gray-300"
                              >
                                {category.title}
                              </button>
                            ))}
                        </div>
                      </Popover.Panel>
                      <Popover.Button
                        className="rounded-full bg-white"
                        type="button"
                      >
                        <div className="flex items-center justify-center rounded-xl bg-authYellow-300 p-1">
                          <div className="flex items-center justify-center rounded-xl bg-gray-100 p-0.5">
                            <PlusIcon className="h-3 w-3 stroke-[3]" />
                          </div>
                        </div>
                        <p className="sr-only">open category list</p>
                      </Popover.Button>
                    </Popover>
                  )}
                </div>
              </div>
            </div>
            <div className="flex w-full items-end gap-2">
              <textarea
                rows={2}
                id="description"
                className="focus:shadow-outline h-32 w-full resize-none rounded-xl bg-gray-300 p-3 text-sm placeholder:text-gray-500 focus:outline-none"
                placeholder="write the description down..."
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
        </div>
        <button
          type="submit"
          disabled={bookCreateMutation.isLoading}
          aria-disabled={bookCreateMutation.isLoading}
          className="self-end rounded-xl bg-slate-500 py-2 px-8 font-semibold text-white hover:bg-slate-700"
        >
          Save
        </button>
      </div>
      <ToastContainer />
    </form>
  );
};

export default CreateBook;
