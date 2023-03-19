import LoadingSpinner from "@components/ui/LoadingSpinner";
import { getServerAuthSession } from "@server/auth";
import { api } from "@utils/api";
import { type GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useForm, type SubmitHandler } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const validationSchema = z.object({
  penname: z
    .string()
    .max(50, { message: "Your penname is too long" })
    .min(1, { message: "Your oenname is required" }),
});

type ValidationSchema = z.infer<typeof validationSchema>;

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getServerAuthSession(context);
  if (!session || session.user.penname !== null) {
    return {
      redirect: {
        destination: "/",
        permanent: true,
      },
    };
  }

  return {
    props: {},
  };
};

const refocusWindow = () => {
  window.blur();
  window.focus();
};

const NewUser = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ValidationSchema>({
    resolver: zodResolver(validationSchema),
  });
  const router = useRouter();
  const updateUser = api.user.update.useMutation({
    onSuccess() {
      refocusWindow();
      void router.replace("/");
    },
  });
  const onSubmitHandler: SubmitHandler<ValidationSchema> = (data) => {
    updateUser.mutate({ penname: data.penname });
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
          className={`focus:shadow-outline w-96 appearance-none rounded border py-2 px-3 leading-tight text-gray-700 shadow focus:outline-none ${
            errorsExist ? "border-red-500" : ""
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
        className="flex h-10 w-32 items-center justify-center rounded-full bg-green-500 py-2 px-8 font-bold text-white hover:bg-green-600"
      >
        {updateUser.isLoading ? <LoadingSpinner /> : <span>Confirm</span>}
      </button>
    </form>
  );
};

export default NewUser;
