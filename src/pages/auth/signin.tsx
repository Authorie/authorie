import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

const SignInPage = () => {
  const { status } = useSession();
  const signInHandler = async (provider: "google" | "facebook") => {
    if (status === "authenticated") {
      await signOut({ redirect: false });
    }
    void signIn(provider, { callbackUrl: "/" });
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-authGreen-600">
      <div className="grid h-3/4 w-3/5 grid-cols-2 rounded-xl bg-slate-50 ">
        <div className="flex items-center justify-center rounded-l-lg bg-authGreen-200">
          <Link href="/">
            <Image
              src="/authorie_logo.svg"
              alt="Authorie Logo"
              width={200}
              height={50}
            />
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center gap-10">
          <h1 className="text-center text-5xl font-bold text-black">
            Welcome to Authorie
          </h1>
          <div className="flex w-3/4 flex-col gap-3">
            <button
              type="button"
              onClick={() => void signInHandler("google")}
              className="flex items-center justify-center rounded-lg bg-slate-200 px-4 py-3 font-semibold text-black shadow-md hover:bg-slate-300"
            >
              <Image
                src="/GoogleLogo.svg"
                alt="google logo"
                width={24}
                height={24}
              />
              <div className="grow">Sign In with Google</div>
            </button>
            <button
              type="button"
              onClick={() => void signInHandler("facebook")}
              className="flex items-center justify-center rounded-lg bg-[#3b5997] px-4 py-3 font-semibold text-white shadow-md hover:bg-blue-600"
            >
              <Image
                src="/FacebookLogo.svg"
                alt="facebook logo"
                width={24}
                height={24}
              />
              <div className="grow">Sign In with Facebook</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
