import { Popover } from "@headlessui/react";
import { MinusIcon, PhotoIcon, PlusIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Category } from "@prisma/client";
import { api } from "@utils/api";
import { useSession } from "next-auth/react";
import Image from "next/legacy/image";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import * as z from "zod";

const validationSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Title is required" })
    .max(100, { message: "Title is too long" }),
  description: z.string().max(1000, { message: "Description is too long" }),
});

type ValidationSchema = z.infer<typeof validationSchema>;

const CreateBook = () => {
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
  const [addedCategories, setAddedCategories] = useState<Category[]>([]);
  const onSubmit: SubmitHandler<ValidationSchema> = async (data) => {
    await bookCreateMutation.mutateAsync(data);
    reset();
  };

  return (
    <form
      onSubmit={(e) => void handleSubmit(onSubmit)(e)}
      className="grid items-center rounded-b-2xl bg-gray-100 px-10 py-28"
    >
      <div className="flex flex-col gap-10">
        <div className="relative flex gap-5 rounded-lg bg-gray-100 px-24 pt-24 pb-11 drop-shadow-lg">
          <div className="absolute top-0 left-0 right-0 -z-10 h-4/6 overflow-hidden rounded-t-lg">
            <Image
              src="/mockWallpaper.jpeg"
              layout="fill"
              alt="book's wallpaper"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-100" />
          </div>
          <div className="relative h-72 w-52 drop-shadow-md">
            <Image
              src="/placeholder_book_cover.png"
              alt="dummy-pic"
              width={208}
              height={288}
              className="rounded-md object-cover"
            />
            <PhotoIcon className="absolute right-2 bottom-2 w-8 cursor-pointer" />
          </div>
          <div className="flex flex-1 flex-col gap-2 pt-6">
            <PhotoIcon className="w-8 cursor-pointer rounded-md bg-gray-100 px-0.5 drop-shadow-sm" />
            <input
              aria-invalid={errors.title ? "true" : "false"}
              id="title"
              type="text"
              className="focus:shadow-outline bg-transparent text-4xl font-bold text-gray-800 placeholder:text-gray-600 focus:outline-none"
              placeholder="Untitled"
              {...register("title")}
            />
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
                    <div className="h-4" />
                    {addedCategories.map((category) => (
                      <span
                        key={category.id}
                        className="select-none whitespace-nowrap rounded-full bg-authYellow-500 px-2 py-0.5 text-xs text-white"
                      >
                        {category.title}
                      </span>
                    ))}
                  </div>
                  {categories && (
                    <Popover className="relative">
                      <Popover.Panel className="absolute left-10 bottom-0 z-10">
                        <div className="flex w-fit flex-col items-start justify-center rounded-xl bg-gray-200 p-2 pt-0">
                          <div className="max-h-52 overflow-y-scroll border-b-2 border-gray-300 pt-2">
                            <div className="h-fit">
                              {categories.map((category) => (
                                <div
                                  key={category.id}
                                  className="mb-2 flex w-72 items-center justify-between rounded-lg bg-white p-2 shadow-md"
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center justify-center overflow-hidden rounded-full">
                                      <Image
                                        src="/mockWallpaper.jpeg"
                                        alt="user profile"
                                        width={40}
                                        height={40}
                                      />
                                    </div>
                                    <h1 className="font-bold">
                                      {category.title}
                                    </h1>
                                  </div>
                                  {addedCategories.includes(category) ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setAddedCategories((prev) =>
                                          prev.filter(
                                            (c) => c.id !== category.id
                                          )
                                        )
                                      }
                                      className="flex items-center justify-center rounded-full  bg-red-500 p-1  text-white hover:bg-red-600"
                                    >
                                      <MinusIcon className="h-4 w-4 stroke-[4]" />
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setAddedCategories((prev) => [
                                          ...prev,
                                          category,
                                        ])
                                      }
                                      className="flex items-center justify-center rounded-full bg-authGreen-500 p-1 text-white hover:bg-authGreen-600"
                                    >
                                      <PlusIcon className="h-4 w-4 stroke-[4]" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
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
            <textarea
              rows={2}
              id="description"
              className="focus:shadow-outline flex-1 resize-none rounded-xl bg-gray-300 p-3 text-sm placeholder:text-gray-500 focus:outline-none"
              placeholder="write the description down..."
              {...register("description")}
            />
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
          className="self-end rounded-xl bg-authBlue-500 py-2 px-8 font-semibold text-white"
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default CreateBook;
