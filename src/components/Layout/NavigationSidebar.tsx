import { useState } from "react";
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
import { Link, Button } from "../Navigation/Items";
import SearchModal from "@components/Search/SearchModal";
import { useSelectCategory } from "@hooks/selectedCategory";
import { api } from "@utils/api";
import type { Session } from "next-auth";

type props = {
  session: Session | null;
};

const NavigationSidebar = ({ session }: props) => {
  const selectCategory = useSelectCategory();
  const { data: user } = api.user.getData.useQuery(undefined, {
    onError(error) {
      if (error.data?.code === "UNAUTHORIZED") {
        return undefined;
      }
    },
  });
  const [openSearchDialog, setOpenSearchDialog] = useState(false);

  return (
    <nav className="text-md fixed flex h-full w-60 flex-col justify-center border-gray-900/20 bg-white px-10 pt-10 sm:justify-start">
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
        {session && (
          <Link href="/[penname]" as="/4444">
            <Image
              src={
                user?.image ||
                session.user?.image ||
                "/profile_image_placeholder.png"
              }
              alt="profile picture"
              width={30}
              height={30}
              className="h-7 w-7 rounded-full"
            />
            <span className="hidden truncate sm:inline-block ">
              {user?.penname || session.user?.penname}
            </span>
          </Link>
        )}
        <Link href="/">
          <HomeIcon className="h-7 w-7" />
          <span className="hidden sm:inline-block">Home</span>
        </Link>
        {session && (
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
        <Button onClick={() => setOpenSearchDialog(true)}>
          <MagnifyingGlassIcon className="h-7 w-7" />
          <span className="hidden sm:inline-block">Search</span>
        </Button>
        <SearchModal
          onCloseDialog={() => setOpenSearchDialog(false)}
          openDialog={openSearchDialog}
        />
        {session && (
          <Link href="/coin-shop" className="hidden sm:flex">
            <Image
              src="/authorie_coin_logo.svg"
              alt="Authorie coin logo"
              width={30}
              height={30}
              className="h-7 w-7"
            />
            <span className="text-amber-500">
              {user?.coin || session.user?.coin} Au
            </span>
          </Link>
        )}
        <div className="mt-2 flex flex-col items-center gap-2 sm:items-stretch">
          {session ? (
            <>
              <Link
                href="/create"
                className="justify-center gap-4 bg-green-700 text-white hover:bg-green-800"
              >
                <PencilIcon width="24" height="24" />
                <span className="hidden sm:block">Create</span>
              </Link>
              <Button
                className="justify-center gap-4 bg-gray-500 text-white hover:bg-gray-600"
                onClick={() => {
                  void signOut();
                  selectCategory("all");
                }}
              >
                <ArrowLeftOnRectangleIcon width="24" height="24" />
                <span className="hidden sm:block">Signout</span>
              </Button>
            </>
          ) : (
            <Button
              className="justify-center gap-4 bg-green-700 text-white hover:bg-green-800"
              onClick={() => {
                void signIn();
                selectCategory("all");
              }}
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
