import { PhotoIcon } from "@heroicons/react/24/outline";
import Image from "next/legacy/image";
import { api } from "@utils/api";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import AuthorSelection from "./AuthorSelection";
import TabInput from "./TabInput";
import CategorySelection from "./CategorySelection";

type FormInput = {
  title: string;
  description: string;
};

const CreateBook = () => {
  const {
    handleSubmit,
    reset,
    register,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
    },
  });
  const utils = api.useContext();
  const bookCreateMutation = api.book.create.useMutation({
    onSuccess: async () => {
      await utils.book.invalidate();
    },
  });

  const onSubmit: SubmitHandler<FormInput> = (data) => {
    bookCreateMutation.mutate({
      title: data.title,
      description: data.description,
    });
    reset();
  };

  return (
    <form
      onSubmit={void handleSubmit(onSubmit)}
      className="flex items-center rounded-b-2xl bg-white px-10 py-28 shadow-lg"
    >
      <div className="flex w-full flex-col items-end gap-4">
        <div className="relative flex w-full gap-5 rounded-lg px-16 pt-20 pb-7 shadow-lg">
          <div className="absolute inset-0 h-4/6 w-full overflow-hidden rounded-t-lg">
            <Image
              src="/mockWallpaper.jpeg"
              layout="fill"
              alt="book's wallpaper"
            />
            <div className="-z-1 absolute inset-0 h-full w-full bg-gradient-to-t from-white" />
          </div>
          <div className="relative flex h-52 w-48 items-center justify-center overflow-hidden rounded">
            <Image src="/favicon.ico" layout="fill" alt="dummy-pic" />
            <PhotoIcon className="absolute right-2 bottom-2 h-6 w-6 cursor-pointer" />
          </div>
          <div className="z-0 flex w-full flex-col justify-end">
            <div className="flex w-full flex-col gap-2">
              <PhotoIcon className="h-6 w-6" />
              <input
                {...register("title", { required: true })}
                aria-invalid={errors.title ? "true" : "false"}
                type="text"
                className="focus:shadow-outline h-18 w-full bg-transparent text-3xl font-semibold placeholder-gray-500 focus:outline-none"
                placeholder="Untitled"
              />
              {errors.title?.type === "required" && (
                <p className="text-xs text-red-400" role="alert">
                  Title is required
                </p>
              )}
              <textarea
                {...register("description")}
                rows={4}
                className="focus:shadow-outline h-36 w-full bg-transparent text-sm placeholder-gray-500 focus:outline-none"
                placeholder="write the description down..."
              />
            </div>
            <TabInput
              isAuthor={true}
              inputList={["fame", "ken"]}
              popover={<AuthorSelection />}
            />
            <TabInput
              isAuthor={false}
              inputList={["stock", "finance"]}
              popover={<CategorySelection />}
            />
          </div>
        </div>
        <button
          type="submit"
          className="hover:bg-authb rounded-xl bg-btnBlue-700 py-2 px-8 font-semibold text-white hover:bg-btnBlue-900"
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default CreateBook;
