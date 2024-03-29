import Image from "next/image";
import Link from "next/link";

type props = {
  pathname: string;
};

function getButtonClassname(selected: boolean) {
  let classname = "px-3 py-px rounded-full hover:bg-gray-200";
  if (selected) {
    classname += " bg-authGreen-500 text-white";
  }
  return classname;
}

const NavigationTopBar = ({ pathname }: props) => {
  return (
    <div className="fixed top-0 z-20 w-full bg-white px-36 py-5">
      <div className="flex items-center gap-4 text-lg font-semibold">
        <Link href="/main/home">
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
        </Link>
        <div className="ml-16 flex items-center gap-2">
          <Link
            href="/main/home"
            className={getButtonClassname(pathname === "/main/home")}
          >
            Home
          </Link>
          <Link
            href="/main/report"
            className={getButtonClassname(pathname === "/main/report")}
          >
            Report
          </Link>
          <Link
            href="/main/privacy"
            className={getButtonClassname(pathname === "/main/privacy")}
          >
            Privacy
          </Link>
          <Link
            href="/main/history"
            className={getButtonClassname(pathname === "/main/history")}
          >
            History
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NavigationTopBar;
