import { Popover } from "@headlessui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Category, User } from "@prisma/client";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { HiOutlinePhoto, HiOutlinePlus } from "react-icons/hi2";
import TextareaAutoSize from "react-textarea-autosize";
import z from "zod";
import { AddAuthorModal } from "~/components/action/AddAuthorModal";
import useImageUpload from "~/hooks/imageUpload";
import { api } from "~/utils/api";

const validationSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Title is required" })
    .max(100, { message: "Title is too long" }),
  description: z.string().max(500, { message: "Description is too long" }),
});

type ValidationSchema = z.infer<typeof validationSchema>;

const CreateBook = () => {
  const router = useRouter();
  useSession({
    required: true,
    onUnauthenticated() {
      void signIn();
    },
  });
  const utils = api.useContext();
  const { data: categories } = api.category.getAll.useQuery();
  const { data: user } = api.user.getData.useQuery();
  const [addedCategories, setAddedCategories] = useState<Category[]>([]);
  const [addedCollaborators, setAddedCollaborators] = useState<User[]>([]);
  const {
    image: bookCover,
    setImageHandler: setBookCover,
    uploadHandler: uploadBookCover,
  } = useImageUpload();
  const {
    image: bookWallpaper,
    setImageHandler: setBookWallpaper,
    uploadHandler: uploadWallpaper,
  } = useImageUpload();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ValidationSchema>({
    resolver: zodResolver(validationSchema),
  });

  const bookCreateMutation = api.book.create.useMutation({
    onSuccess(_data, _variables, _context) {
      if (user) {
        void utils.book.getAll.invalidate({ penname: user.penname! });
        void router.push(`/${user.penname!}/book`);
      }
    },
  });

  const toggleCollaboratorsHandler = (collaborator: User) => {
    setAddedCollaborators((prev) =>
      prev.includes(collaborator)
        ? prev.filter((data) => data !== collaborator)
        : [...prev, collaborator]
    );
  };

  const submitHandler = handleSubmit(async ({ title, description }) => {
    if (!user) {
      toast.error("You are not logged in!");
      return;
    }
    const [coverImageUrl, wallpaperImageUrl] = await Promise.all([
      uploadBookCover(),
      uploadWallpaper(),
    ]);
    const promiseCreateBook = bookCreateMutation.mutateAsync({
      title,
      description,
      coverImageUrl,
      wallpaperImageUrl,
      invitees: addedCollaborators.map((data) => data.id),
      categoryIds: addedCategories.map((category) => category.id),
    });
    await toast.promise(promiseCreateBook, {
      loading: `Creating a book called ${title}`,
      success: `Created ${title} successfully!`,
      error: "Error occured while creating book!",
    });
  });

  return (
    <form
      onSubmit={(e) => void submitHandler(e)}
      className="items-center rounded-b-2xl bg-white px-10 py-5"
    >
      <div className="flex flex-col gap-10">
        <div className="relative flex min-h-[550px] gap-5 rounded-lg bg-gray-100 px-24 pb-11 pt-24 drop-shadow-lg">
          <div className="absolute left-0 right-0 top-0 -z-10 h-72 self-end overflow-hidden rounded-t-lg">
            {bookWallpaper ? (
              <Image
                src={bookWallpaper}
                height={200}
                width={2000}
                alt="book's wallpaper"
              />
            ) : (
              <div className="h-full w-full bg-authGreen-500"></div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-100" />
            <label
              htmlFor="BookWallpaper"
              className="absolute left-4 top-4 h-7 w-8"
            >
              <input
                id="BookWallpaper"
                type="file"
                accept="image/*"
                name="BookWallpaper"
                className="hidden cursor-pointer"
                onChange={setBookWallpaper}
              />
              <HiOutlinePhoto className="h-8 w-8 cursor-pointer rounded-md bg-gray-100 px-0.5 drop-shadow-sm" />
            </label>
          </div>
          <label
            htmlFor="BookCover"
            className="relative h-72 w-52 cursor-pointer self-end drop-shadow-md"
          >
            <input
              id="BookCover"
              type="file"
              accept="image/*"
              name="BookCover"
              className="hidden cursor-pointer"
              onChange={setBookCover}
            />

            {bookCover ? (
              <Image
                fill
                alt="book's cover"
                src={bookCover}
                className="rounded-md object-cover"
              />
            ) : (
              <div className="h-full w-full rounded-md bg-authGreen-400" />
            )}
            <HiOutlinePhoto className="absolute bottom-2 right-2 h-8 w-8 rounded-md bg-gray-100" />
          </label>
          <div className="flex grow flex-col justify-end gap-2 pt-6">
            <div className="flex items-end gap-2">
              <TextareaAutoSize
                id="title"
                minRows={1}
                aria-invalid={errors.title ? "true" : "false"}
                className="focus:shadow-outline resize-none bg-transparent text-4xl font-bold text-gray-800 placeholder:text-gray-400 focus:outline-none"
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
                {errors.title.message?.toString()}
              </p>
            )}
            <div className="flex flex-col gap-1 pl-1">
              <div className="flex items-center gap-2">
                <h5 className="text-sm text-gray-500">Author</h5>
                <div className="flex items-center gap-2">
                  <div className="flex w-96 items-center gap-2 overflow-x-auto rounded-xl bg-authGreen-300 px-2 py-1 ">
                    <span className="select-none rounded-full bg-authGreen-600 px-2 py-0.5 text-xs text-white">
                      {user?.penname || ""}
                    </span>
                    {addedCollaborators.map((collaborator) => (
                      <span
                        onClick={() => toggleCollaboratorsHandler(collaborator)}
                        key={collaborator.id}
                        className="cursor-pointer select-none rounded-full bg-authGreen-600 px-2 py-0.5 text-xs text-white hover:bg-red-600"
                      >
                        {collaborator.penname}
                      </span>
                    ))}
                  </div>
                  <Popover className="relative">
                    <Popover.Panel className="absolute -left-10 bottom-0 z-10 max-h-96 overflow-y-auto">
                      <AddAuthorModal
                        toogleCollaboratorsHandler={toggleCollaboratorsHandler}
                        addedCollaborators={addedCollaborators}
                      />
                    </Popover.Panel>
                    <Popover.Button
                      className="rounded-full bg-white"
                      type="button"
                    >
                      <div className="flex items-center justify-center rounded-full bg-authGreen-300 p-1 hover:bg-authGreen-500">
                        <div className="flex items-center justify-center gap-2 rounded-xl bg-gray-100 p-0.5 px-2 text-xs font-semibold">
                          <HiOutlinePlus className="h-3 w-3 stroke-[3]" />
                          <span>Invite Authors</span>
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
                  <div className="flex w-96 flex-wrap items-center gap-2 rounded-xl bg-authYellow-300 px-2 py-1">
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
                      <Popover.Panel className="absolute -left-10 bottom-0 z-10">
                        <div className="grid h-96 w-max grid-cols-2 gap-2 overflow-y-auto rounded-xl bg-gray-200 p-2">
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
                        <div className="flex items-center justify-center rounded-xl bg-authYellow-300 p-1 hover:bg-authYellow-500">
                          <div className="flex items-center justify-center gap-2 rounded-xl bg-gray-100 p-0.5 px-2 text-xs font-semibold">
                            <HiOutlinePlus className="h-3 w-3 stroke-[3]" />
                            <span>Add categories</span>
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
              <TextareaAutoSize
                minRows={2}
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
                {errors.description.message?.toString()}
              </p>
            )}
          </div>
        </div>
        <div className="flex justify-between">
          <p className="text-sm text-gray-500">
            Note: You can only invite the author who follow you and you follow
            back
          </p>
          <button
            type="submit"
            disabled={bookCreateMutation.isLoading}
            aria-disabled={bookCreateMutation.isLoading}
            className="rounded-xl bg-slate-500 px-8 py-2 font-semibold text-white hover:bg-slate-700"
          >
            Create
          </button>
        </div>
      </div>
    </form>
  );
};

export default CreateBook;
