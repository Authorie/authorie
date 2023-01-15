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
      <ul className="mt-6 flex flex-col items-center gap-2 sm:mt-10 sm:items-stretch">
        {username && profileImage && coin && (
          <Link href="/account">
            <Image
              src={profileImage}
              alt="profile picture"
              width={30}
              height={30}
              className="rounded-full"
              priority
            />
            <span className="hidden sm:inline-block">{username}</span>
          </Link>
        )}
        <Link href="/">
          <HomeIcon width={30} height={30} />
          <span className="hidden sm:inline-block">Home</span>
        </Link>
        {username && profileImage && coin && (
          <>
            <Link href="/notifications">
              <BellIcon width={30} height={30} />
              <span className="hidden sm:inline-block">Notification</span>
            </Link>
            <Link href="/messages">
              <ChatBubbleOvalLeftEllipsisIcon width={30} height={30} />
              <span className="hidden sm:inline-block">Messages</span>
            </Link>
          </>
        )}
        <Button>
          <MagnifyingGlassIcon width={30} height={30} />
          <span className="hidden sm:inline-block">Search</span>
        </Button>
        {username && profileImage && coin && (
          <Link href="/coin-shop" parentClassName="hidden sm:inline-block mb-2">
            <Image
              src="/authorie_coin_logo.svg"
              alt="Authorie coin logo"
              width={30}
              height={30}
            />
            <span className="text-amber-500">{coin} Au</span>
          </Link>
        )}
        {username && profileImage && coin ? (
          <Button
            className="justify-center gap-4 bg-green-700 text-white hover:bg-green-800"
            parentClassName="mt-2 sm:mt-0"
          >
            <PencilIcon width="24" height="24" />
            <span className="hidden sm:block">Create</span>
          </Button>
        ) : (
          <>
            <Button
              className="justify-center gap-4 bg-gray-500 text-white hover:bg-gray-600"
              parentClassName="mt-2 sm:mt-0"
            >
              <span className="hidden sm:block">Register</span>
            </Button>
            <Button className="justify-center gap-4 bg-green-700 text-white hover:bg-green-800">
              <span className="hidden sm:block">Login</span>
            </Button>
          </>
        )}
      </ul>
    </nav>
  );
};

export default NavigationSidebar;
