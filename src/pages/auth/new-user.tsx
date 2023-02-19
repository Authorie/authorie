import { api } from "@utils/api";
import { useRouter } from "next/router";
import { useForm, Resolver } from "react-hook-form";

type FormValues = {
  name: string;
};

const resolver: Resolver<FormValues> = async (values) => {
  return {
    values: values.name ? values : {},
    errors: !values.name
      ? {
          name: {
            type: "required",
            message: "Author name is required.",
          },
        }
      : {},
  };
};

const NewUser = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver });
  const router = useRouter();
  const updateUser = api.user.update.useMutation();
  const onSubmit = handleSubmit((data) => {
    updateUser.mutate({ name: data.name });
    router.replace("/");
  });

  return (
    <form
      onSubmit={onSubmit}
      className="flex h-screen flex-col items-center justify-center gap-6"
    >
      <div className="grid items-center gap-x-6 gap-y-2">
        <label className="text-md font-bold text-gray-700">
          Enter your author name:
        </label>
        <input
          {...register("name")}
          aria-invalid={Boolean(errors.name)}
          className={`focus:shadow-outline w-[350px] appearance-none rounded border py-2 px-3 leading-tight text-gray-700 shadow focus:outline-none ${
            errors.name ? "border-red-500" : ""
          }`}
          id="username"
          type="text"
          placeholder="your pen name..."
        />
        <div className="col-start-2 self-start">
          {errors.name?.type === "required" && (
            <p role="alert" className="text-sm text-red-600">
              Please enter your pen name
            </p>
          )}
        </div>
      </div>
      <button
        type="submit"
        disabled={updateUser.isLoading}
        aria-disabled={updateUser.isLoading}
        className="w-fit rounded-full bg-green-500 py-2 px-8 font-bold text-white hover:bg-green-600"
      >
        {updateUser.isLoading ? (
          <svg
            className="h-4 w-4 animate-spin text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : (
          <span>Confirm</span>
        )}
      </button>
    </form>
  );
};

export default NewUser;
