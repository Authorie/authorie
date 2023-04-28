import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useForm, type SubmitHandler } from "react-hook-form";
import z from "zod";
import LoadingSpinner from "~/components/ui/LoadingSpinner";
import { api } from "~/utils/api";

const validationSchema = z.object({
  penname: z
    .string()
    .max(50, { message: "Your penname is too long" })
    .min(1, { message: "Your penname is required" }),
});

type ValidationSchema = z.infer<typeof validationSchema>;

const NewUserForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ValidationSchema>({
    resolver: zodResolver(validationSchema),
  });

  const router = useRouter();
  const context = api.useContext();
  useSession({
    required: true,
    onUnauthenticated() {
      void signIn();
    },
  });
  api.user.getData.useQuery(undefined, {
    onSuccess(data) {
      if (data.penname) void router.replace("/");
    },
  });
  const updateUser = api.user.update.useMutation();
  const onSubmitHandler: SubmitHandler<ValidationSchema> = (data) => {
    updateUser.mutate(
      { penname: data.penname },
      {
        onSuccess() {
          void context.user.getData.invalidate(undefined);
          if (router.query.callbackUrl) {
            void router.replace(router.query.callbackUrl as string);
          } else {
            void router.replace("/");
          }
        },
      }
    );
  };
  const errorsExist = Boolean(errors.penname || updateUser.isError);

  return (
    <form
      onSubmit={(e) => void handleSubmit(onSubmitHandler)(e)}
      className="flex h-screen flex-col items-center justify-center gap-3"
    >
      <div className="grid items-center gap-x-6 gap-y-2">
        <label className="text-md font-bold text-gray-700">
          Enter your author name:
        </label>
        <input
          {...register("penname")}
          aria-invalid={errorsExist}
          className={`focus:shadow-outline w-96 appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none ${errorsExist ? "border-red-500" : ""
            }`}
          id="username"
          type="text"
          placeholder="your pen name..."
        />
        <div
          aria-hidden={!errorsExist}
          className="visible col-start-2 self-start aria-hidden:invisible"
        >
          <p role="alert" className="text-sm text-red-600">
            {errors.penname
              ? "Please enter your pen name."
              : updateUser.isError
                ? "The pen name already exists. Please enter a new one."
                : ""}
          </p>
        </div>
      </div>
      <button
        type="submit"
        disabled={updateUser.isLoading}
        aria-disabled={updateUser.isLoading}
        className="flex h-10 w-32 items-center justify-center rounded-full bg-green-500 px-8 py-2 font-bold text-white hover:bg-green-600"
      >
        {updateUser.isLoading ? <LoadingSpinner /> : <span>Confirm</span>}
      </button>
    </form>
  );
};

export default NewUserForm;
