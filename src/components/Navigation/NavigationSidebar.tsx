import NextLink from "next/link";
import Image from "next/image";
import {
  BellIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  ArrowLeftOnRectangleIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { PencilIcon } from "@heroicons/react/24/solid";
import { signIn, signOut } from "next-auth/react";
import SearchModal from "@components/Search/SearchModal";
import { Link, Button } from "./Items";
import { useState } from "react";

type User = {
  username: string;
  profileImage: string;
  coin: number;
};

const NavigationSidebar = ({ user }: { user: User | undefined }) => {
  const [openSearchModal, setOpenSearchModal] = useState<boolean>(false);

  const onSearchHandler = () => {
    setOpenSearchModal(true);
  };

  const onCloseSearchHandler = () => {
    setOpenSearchModal(false);
  };

  return (
    <nav className="text-md top-0 bottom-0 flex min-h-screen w-60 flex-col justify-center overflow-y-auto border-gray-900/20 bg-white px-10 pt-10 sm:justify-start">
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
        {user && (
          <Link href="/account">
            <Image
              src={user.profileImage}
              alt="profile picture"
              width={30}
              height={30}
              className="h-7 w-7 rounded-full"
            />
            <span className="hidden truncate sm:inline-block ">
              {user.username}
            </span>
          </Link>
        )}
        <Link href="/">
          <HomeIcon className="h-7 w-7" />
          <span className="hidden sm:inline-block">Home</span>
        </Link>
        {user && (
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
        <Button onClick={onSearchHandler}>
          <MagnifyingGlassIcon className="h-7 w-7" />
          <span className="hidden sm:inline-block">Search</span>
        </Button>
        {openSearchModal && (
          <SearchModal onCloseSearchHandler={onCloseSearchHandler} />
        )}
        {user && (
          <Link href="/coin-shop" className="hidden sm:flex">
            <Image
              src="/authorie_coin_logo.svg"
              alt="Authorie coin logo"
              width={30}
              height={30}
              className="h-7 w-7"
            />
            <span className="text-amber-500">{user.coin} Au</span>
          </Link>
        )}
        <div className="mt-2 flex flex-col items-center gap-2 sm:items-stretch">
          {user ? (
            <>
              <Button className="justify-center gap-4 bg-green-700 text-white hover:bg-green-800">
                <PencilIcon width="24" height="24" />
                <span className="hidden sm:block">Create</span>
              </Button>
              <Button
                className="justify-center gap-4 bg-gray-500 text-white hover:bg-gray-600"
                onClick={() => void signOut()}
              >
                <ArrowLeftOnRectangleIcon width="24" height="24" />
                <span className="hidden sm:block">Signout</span>
              </Button>
            </>
          ) : (
            <Button
              className="justify-center gap-4 bg-green-700 text-white hover:bg-green-800"
              onClick={() => void signIn()}
            >
              <ArrowRightOnRectangleIcon width="24" height="24" />
              <span className="hidden sm:block">Login</span>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavigationSidebar;
