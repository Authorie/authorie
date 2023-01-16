import NextLink from "next/link";
import Image from "next/image";
import {
  BellIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  HomeIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { PencilIcon } from "@heroicons/react/24/solid";

import { Link, Button } from "./Items";

const NavigationSidebar = ({
  username,
  profileImage,
  coin,
}: {
  username: string;
  profileImage: string;
  coin: number;
}) => {
  return (
    <nav className="text-md fixed top-0 bottom-0 flex min-h-screen w-fit flex-col justify-center overflow-y-auto bg-white px-3 pt-10 shadow-xl ring-1 ring-gray-900/5 sm:justify-start">
      <NextLink href="/">
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
      <div className="mt-6 flex flex-col items-center gap-2 sm:mt-10 sm:items-stretch">
        {username && profileImage && coin && (
          <Link href="/account">
            <Image
              src={profileImage}
              alt="profile picture"
              width={30}
              height={30}
              className="h-7 w-7 rounded-full"
            />
            <span className="hidden sm:inline-block">{username}</span>
          </Link>
        )}
        <Link href="/">
          <HomeIcon className="h-7 w-7" />
          <span className="hidden sm:inline-block">Home</span>
        </Link>
        {username && profileImage && coin && (
          <>
            <Link href="/notifications">
              <BellIcon className="h-7 w-7" />
              <span className="hidden sm:inline-block">Notification</span>
            </Link>
            <Link href="/messages">
              <ChatBubbleOvalLeftEllipsisIcon className="h-7 w-7" />
              <span className="hidden sm:inline-block">Messages</span>
            </Link>
          </>
        )}
        <Button>
          <MagnifyingGlassIcon className="h-7 w-7" />
          <span className="hidden sm:inline-block">Search</span>
        </Button>
        {username && profileImage && coin && (
          <Link href="/coin-shop" className="hidden sm:flex">
            <Image
              src="/authorie_coin_logo.svg"
              alt="Authorie coin logo"
              width={30}
              height={30}
              className="h-7 w-7"
            />
            <span className="text-amber-500">{coin} Au</span>
          </Link>
        )}
        {username && profileImage && coin ? (
          <Button className="justify-center gap-4 bg-green-700 text-white hover:bg-green-800">
            <PencilIcon width="24" height="24" />
            <span className="hidden sm:block">Create</span>
          </Button>
        ) : (
          <>
            <Button className="justify-center gap-4 bg-gray-500 text-white hover:bg-gray-600">
              <span className="hidden sm:block">Register</span>
            </Button>
            <Button className="justify-center gap-4 bg-green-700 text-white hover:bg-green-800">
              <span className="hidden sm:block">Login</span>
            </Button>
          </>
        )}
      </div>
    </nav>
  );
};

export default NavigationSidebar;
