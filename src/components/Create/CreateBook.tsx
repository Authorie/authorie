import { PhotoIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@utils/api";
import { useSession } from "next-auth/react";
import Image from "next/legacy/image";
import { useRouter } from "next/router";
import { useForm, type SubmitHandler } from "react-hook-form";
import * as z from "zod";

const validationSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Title is required" })
    .max(100, { message: "Title is too long" }),
  description: z.string().max(1000, { message: "Description is too long" }),
  categoryIds: z.string().uuid().array().default([]),
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
  const bookCreateMutation = api.book.create.useMutation({
    onSuccess: async () => {
      await utils.book.invalidate();
    },
  });

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
            <PhotoIcon className="absolute right-2 bottom-2 h-8 w-8 cursor-pointer" />
          </div>
          <div className="flex flex-1 flex-col gap-2 pt-6">
            <PhotoIcon className="h-8 w-8" />
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
                <div className="flex gap-2 rounded-xl bg-authGreen-300 px-2 py-1">
                  <div className="max-w-52 flex items-center gap-2 overflow-x-auto">
                    <span className="select-none rounded-full bg-authGreen-600 px-2 py-0.5 text-xs text-white">
                      {session?.user.penname}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <h5 className="text-sm text-gray-500">Author</h5>
                <div className="flex gap-2 rounded-xl bg-authYellow-300 px-2 py-1">
                  <div className="max-w-52 flex items-center gap-2 overflow-x-auto">
                    <span className="select-none rounded-full bg-authYellow-500 px-2 py-0.5 text-xs text-white">
                      investment
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <textarea
              rows={4}
              id="description"
              className="focus:shadow-outline flex-1 rounded-xl bg-gray-300 p-3 text-sm placeholder:text-gray-500 focus:outline-none"
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
