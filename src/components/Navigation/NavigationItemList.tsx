import Image from "next/image";
import NavigationItem from "./NavigationItem";
import {
  BellIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  HeartIcon,
  HomeIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { PencilIcon } from "@heroicons/react/24/solid";

interface Props {
  username: string;
  profileImage: string;
  coin: number;
}

const NavigationItemList = ({ username, profileImage, coin }: Props) => {
  return (
    <ul className="mt-6 flex flex-col items-center gap-4 md:mt-10 md:items-stretch">
      <NavigationItem href="/account">
        <Image
          src={profileImage}
          alt="profile picture"
          width={30}
          height={30}
          className="rounded-full"
        />
        <span className="hidden md:block">{username}</span>
      </NavigationItem>
      <NavigationItem href="/">
        <HomeIcon width={30} height={30} />
        <span className="hidden sm:inline-block">Home</span>
      </NavigationItem>
      {username && profileImage && coin ? (
        <>
          <NavigationItem href="/notifications">
            <BellIcon width={30} height={30} />
            <span className="hidden sm:inline-block">Notification</span>
          </NavigationItem>
          <NavigationItem href="/messages">
            <ChatBubbleOvalLeftEllipsisIcon width={30} height={30} />
            <span className="hidden sm:inline-block">Messages</span>
          </NavigationItem>
        </>
      ) : undefined}
      <NavigationItem href="/search">
        <MagnifyingGlassIcon width={30} height={30} />
        <span className="hidden sm:inline-block">Search</span>
      </NavigationItem>
      <NavigationItem href="#">
        <Image
          src="/authorie_coin_logo.svg"
          alt="Authorie coin logo"
          width={30}
          height={30}
        />
        <span className="hidden text-amber-500 sm:inline-block">{coin} Au</span>
      </NavigationItem>
      {username && profileImage && coin ? (
        <NavigationItem
          href="#"
          className="justify-center gap-4 bg-green-700 text-white hover:bg-green-800"
        >
          <PencilIcon width="24" height="24" />
          <span className="hidden md:block">Create</span>
        </NavigationItem>
      ) : (
        <>
          <NavigationItem
            href="#"
            className="justify-center gap-4 bg-gray-500 text-white hover:bg-gray-600"
          >
            <span className="hidden md:block">Register</span>
          </NavigationItem>
          <NavigationItem
            href="#"
            className="justify-center gap-4 bg-green-700 text-white hover:bg-green-800"
          >
            <span className="hidden md:block">Login</span>
          </NavigationItem>
        </>
      )}
    </ul>
  );
};

export default NavigationItemList;
