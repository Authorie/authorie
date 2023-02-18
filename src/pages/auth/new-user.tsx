import { api } from "@utils/api";
import { useRouter } from "next/router";
import { useForm, type SubmitHandler } from "react-hook-form";

interface IFormInputs {
  penName: string;
}

const NewUser = () => {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<IFormInputs>();
  const router = useRouter();
  const updateUser = api.user.update.useMutation();
  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    updateUser.mutate({ name: data.penName });
    try {
      await router.replace("/");
    } catch (error) {
      console.error(error); // TODO: Handle error
    }
  };

  return (
    <form
      onSubmit={() => handleSubmit(onSubmit)}
      className="flex h-screen flex-col items-center justify-center"
    >
      <div className="flex items-center gap-4">
        <label className="text-md font-bold text-gray-700">
          Enter your pen name:
        </label>
        <div className="flex-col align-top">
          <input
            {...register("penName", { required: true })}
            aria-invalid={errors.penName ? "true" : "false"}
            className={`focus:shadow-outline w-[350px] appearance-none rounded border py-2 px-3 leading-tight text-gray-700 shadow focus:outline-none ${
              errors.penName ? "border-red-500" : ""
            }`}
            id="penName"
            type="text"
            placeholder="your pen name..."
          />
        </div>
      </div>
      <div className="mb-5 ml-5 mt-1 h-[20px]">
        {errors.penName?.type === "required" && (
          <p role="alert" className="text-sm text-red-600">
            Please enter your pen name
          </p>
        )}
      </div>
      <button
        type="submit"
        className="rounded-full bg-green-500 py-2 px-8 font-bold text-white hover:bg-green-600"
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
