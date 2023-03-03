import { PhotoIcon } from "@heroicons/react/24/outline";
import Image from "next/legacy/image";
// import AddAuthorModal from "./AddAuthorModal";
// import { Popover } from "@headlessui/react";
import { api } from "@utils/api";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";

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
      className="flex items-center rounded-b-2xl bg-gray-100 px-10 py-28"
    >
      <div className="flex w-full flex-col items-end gap-4">
        <div className="relative flex w-full gap-5 rounded-lg px-16 pt-20 pb-7 shadow-lg">
          <div className="absolute inset-0 h-4/6 w-full overflow-hidden rounded-t-lg">
            <Image
              src="/mockWallpaper.jpeg"
              layout="fill"
              alt="book's wallpaper"
            />
            <div className="-z-1 absolute inset-0 h-full w-full bg-gradient-to-t from-gray-100" />
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
                className="focus:shadow-outline h-18 w-full bg-transparent text-3xl font-semibold focus:outline-none"
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
                className="focus:shadow-outline max-h-16 w-full bg-transparent text-sm focus:outline-none"
                placeholder="write the description down..."
              />
            </div>
            {/* TODO */}
            {/* <div className="flex items-center gap-2">
              <h5 className="text-sm font-semibold">Author :</h5>
              <div className="flex gap-2 rounded-xl bg-authGreen-500 px-3 py-1">
                <div className="flex w-52 items-center gap-2 overflow-x-scroll">
                  <button className="rounded-full bg-emerald-800 px-5 py-1 text-xs font-semibold text-white">
                    four58
                  </button>
                  {authorList.map(
                    (data) =>
                      data != "four58" && (
                        <button
                          key={data}
                          className="rounded-full bg-gray-500 px-5 py-1 text-xs text-white"
                        >
                          {data}
                        </button>
                      )
                  )}
                </div>
                <Popover className="relative">
                  <Popover.Panel className="absolute -left-20 bottom-8 z-10">
                    <AddAuthorModal />
                  </Popover.Panel>
                  <Popover.Button className="h-6 w-6 rounded-full bg-white text-xs">
                    +
                  </Popover.Button>
                </Popover>
              </div>
            </div> */}
          </div>
        </div>
        <button
          type="submit"
          className="rounded-xl bg-authBlue-500 py-2 px-8 text-white"
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default CreateBook;
