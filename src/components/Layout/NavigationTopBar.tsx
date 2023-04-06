import Image from "next/image";
import NextLink from "next/link";
import { useRouter } from "next/router";

const NavigationTopBar = () => {
  const router = useRouter();
  return (
    <nav className="fixed top-0 z-20 w-full bg-white px-36 py-5">
      <div className="flex items-center gap-4 text-lg font-semibold">
        <NextLink href="/main/home">
          <Image
            src="/authorie_logo.svg"
            alt="Authorie Logo"
            width="276"
            height="120"
            className="mx-auto hidden h-10 w-auto sm:block"
            priority
          />
          <Image
            src="/authorie_logo_minified.svg"
            alt="Authorie Logo"
            width="30"
            height="12"
            className="mx-auto sm:hidden"
            priority
          />
        </NextLink>
        <div className="ml-16 flex items-center gap-2">
          <button
            className={`${
              router.pathname === "/main/home"
                ? "bg-authGreen-500 text-white"
                : ""
            } h-8 w-20 rounded-full hover:bg-gray-200`}
          >
            <NextLink href="/main/home">Home</NextLink>
          </button>
          <button
            onClick={() => void router.push("/main/report")}
            className={`${
              router.pathname === "/main/report"
                ? "bg-authGreen-500 text-white"
                : ""
            } h-8 w-20 rounded-full hover:bg-gray-200`}
          >
            <NextLink href="/main/report">Report</NextLink>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavigationTopBar;
