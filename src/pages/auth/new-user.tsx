import { useForm, SubmitHandler } from "react-hook-form";

interface IFormInputs {
  penName: string;
}

const NewUser = () => {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<IFormInputs>();

  const onSubmit: SubmitHandler<IFormInputs> = (data) => console.log(data);

  let inputClassName = "";
  if (errors.penName) {
    inputClassName = "border-red-500";
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
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
            className={`focus:shadow-outline w-[350px] appearance-none rounded border py-2 px-3 leading-tight text-gray-700 shadow focus:outline-none ${inputClassName}`}
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
        Confirm
      </button>
    </form>
  );
};

export default NewUser;
