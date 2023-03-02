import LoadingSpinner from "@components/ui/LoadingSpinner";
import { getServerAuthSession } from "@server/auth";
import { api } from "@utils/api";
import { type GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useForm, type Resolver } from "react-hook-form";

type FormValues = {
  penname: string;
};

const resolver: Resolver<FormValues> = (values) => ({
  values: values.penname ? values : {},
  errors: !values.penname
    ? {
        penname: {
          type: "required",
          message: "penname is required.",
        },
      }
    : {},
});

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getServerAuthSession(context);
  if (!session?.user || Boolean(session.user.penname)) {
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

const NewUser = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver });
  const router = useRouter();
  const utils = api.useContext();
  const updateUser = api.user.update.useMutation({
    onSuccess() {
      void utils.user.invalidate();
      void router.replace("/");
    },
  });
  const onSubmit = handleSubmit((data) => {
    updateUser.mutate({ penname: data.penname });
  });

  return (
    <form
      onSubmit={(e) => void onSubmit(e)}
      className="flex h-screen flex-col items-center justify-center gap-3"
    >
      <div className="grid items-center gap-x-6 gap-y-2">
        <label className="text-md font-bold text-gray-700">
          Enter your author name:
        </label>
        <input
          {...register("penname")}
          aria-invalid={Boolean(errors.penname)}
          className={`focus:shadow-outline w-96 appearance-none rounded border py-2 px-3 leading-tight text-gray-700 shadow focus:outline-none ${
            errors.penname ? "border-red-500" : ""
          }`}
          id="username"
          type="text"
          placeholder="your pen name..."
        />
        <div
          aria-hidden={!errors.penname}
          className="visible col-start-2 self-start aria-hidden:invisible"
        >
          <p role="alert" className="text-sm text-red-600">
            Please enter your pen name
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
