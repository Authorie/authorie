import { signIn, signOut, useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Image from "next/image";
import NextLink from "next/link";
import { useCallback, useState } from "react";
import {
  HiOutlineArrowLeftOnRectangle,
  HiOutlineArrowRightOnRectangle,
  HiOutlineHome,
  HiOutlineMagnifyingGlass,
  HiPencil,
  HiOutlineBookOpen,
  HiOutlineShoppingCart,
} from "react-icons/hi2";
import { Button, Link } from "~/components/ui/NavigationItems";
import { useSelectCategory } from "~/hooks/selectedCategory";
import { api } from "~/utils/api";
const SearchModal = dynamic(() => import("~/components/Search/SearchModal"));

const NavigationSidebar = () => {
  const { status, data: session } = useSession();
  const selectCategory = useSelectCategory();
  const [openSearchDialog, setOpenSearchDialog] = useState(false);
  const { data: user } = api.user.getData.useQuery(undefined, {
    enabled: status === "authenticated",
  });
  const onOpenDialogHandler = useCallback(() => setOpenSearchDialog(true), []);
  const onCloseDialogHandler = useCallback(
    () => setOpenSearchDialog(false),
    []
  );

  return (
    <div className="text-md fixed z-50 flex h-full w-60 flex-col justify-center border-gray-900/20 bg-white px-10 pt-10 sm:justify-start">
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
        {session &&
          (user ? (
            <>
              <Link href={user.penname ? `/${user.penname}` : "/auth/new-user"}>
                <div className="relative h-7 w-7 overflow-hidden rounded-full">
                  <Image
                    src={user.image || "/placeholder_profile.png"}
                    alt="profile picture"
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="hidden truncate sm:inline-block">
                  {user.penname}
                </span>
              </Link>
              <Link
                href={user.penname ? `/${user.penname}/book` : "/auth/new-user"}
              >
                <HiOutlineBookOpen className="h-7 w-7" />
                <span className="hidden sm:inline-block">My book</span>
              </Link>
              <Link href={"/chapter/purchased"}>
                <HiOutlineShoppingCart className="h-7 w-7" />
                <span className="hidden sm:inline-block">Purchased</span>
              </Link>
            </>
          ) : (
            <Link href="/">
              <div className="h-7 w-7 animate-pulse rounded-full bg-black/60" />
            </Link>
          ))}
        <Link href="/">
          <HiOutlineHome className="h-7 w-7" />
          <span className="hidden sm:inline-block">Home</span>
        </Link>
        {/* {session && (
          <>
            <Link aria-label="/notifications" href="/404">
              <HiOutlineBell className="h-7 w-7" />
              <span className="hidden sm:inline-block">Notification</span>
            </Link>
            <Link aria-label="/messages" href="/404">
              <HiOutlineChatBubbleOvalLeftEllipsis className="h-7 w-7" />
              <span className="hidden sm:inline-block">Messages</span>
            </Link>
          </>
        )} */}
        <Button onClick={onOpenDialogHandler}>
          <HiOutlineMagnifyingGlass className="h-7 w-7" />
          <span className="hidden sm:inline-block">Search</span>
        </Button>
        <SearchModal
          onCloseDialog={onCloseDialogHandler}
          openDialog={openSearchDialog}
        />
        {session && (
          <Button className="hidden sm:flex">
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
          </Button>
        )}
        <div className="mt-2 flex flex-col items-center gap-2 sm:items-stretch">
          {session ? (
            <>
              <Link
                href="/create/book"
                className="justify-center gap-4 bg-green-700 text-white hover:bg-green-800"
              >
                <HiPencil className="h-6 w-6" />
                <span className="hidden sm:block">Create</span>
              </Link>
              <Button
                className="justify-center gap-4 bg-gray-500 text-white hover:bg-gray-600"
                onClick={() => {
                  void signOut();
                  selectCategory("all");
                }}
              >
                <HiOutlineArrowLeftOnRectangle className="h-6 w-6" />
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
              <HiOutlineArrowRightOnRectangle className="h-6 w-6" />
              <span className="hidden sm:block">Login</span>
            </Button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-1">
          <NextLink
            className="mt-2 text-xs font-light text-gray-500 hover:underline"
            href="/main/home"
          >
            About us
          </NextLink>
          <div className="flex items-center gap-1">
            <div className="text-sm text-gray-500">.</div>
            <NextLink
              className="mt-2 text-xs font-light text-gray-500 hover:underline"
              href="/main/report"
            >
              Report
            </NextLink>
          </div>
          <div className="flex items-center gap-1">
            <div className="text-sm text-gray-500">.</div>
            <NextLink
              className="mt-2 text-xs font-light text-gray-500 hover:underline"
              href="/main/privacy"
            >
              Privacy
            </NextLink>
          </div>
          <div className="flex items-center gap-1">
            <div className="mb-2 text-sm text-gray-500">.</div>
            <NextLink
              className="text-xs font-light text-gray-500 hover:underline"
              href="/main/history"
            >
              History
            </NextLink>
          </div>
          <div className="flex items-center gap-1">
            <div className="mb-2 text-sm text-gray-500">.</div>
            <p className="text-xs font-light text-gray-500">Authorie 2023</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavigationSidebar;
