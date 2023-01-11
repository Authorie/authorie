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
  if (username && profileImage && coin) {
    return (
      <ul className="mt-8 flex flex-col items-center gap-4 md:mt-12 md:items-stretch">
        <li>
          <a
            href="#"
            className="flex items-center justify-start gap-6 rounded-full p-4 hover:bg-gray-200"
          >
            <Image
              src={profileImage}
              alt="profile picture"
              width="30"
              height="30"
              className="rounded-full"
            />
            <span className="hidden md:block">{username}</span>
          </a>
        </li>
        <NavigationItem Icon={HomeIcon} title="Home" />
        <NavigationItem Icon={HeartIcon} title="Favorites" />
        <NavigationItem Icon={BellIcon} title="Notification" />
        <NavigationItem
          Icon={ChatBubbleOvalLeftEllipsisIcon}
          title="Messages"
        />
        <NavigationItem Icon={MagnifyingGlassIcon} title="Search" />
        <NavigationItem
          Icon={({ width, height }) => (
            <Image
              src="/authorie_coin_logo.svg"
              alt="Authorie coin logo"
              width={width}
              height={height}
            />
          )}
          title={`${coin} Au`}
          className="text-amber-500"
        />
        <li className="mt-2">
          <a
            href="#"
            className="flex items-center justify-center gap-6 rounded-full bg-green-700 p-4 text-white hover:bg-green-800"
          >
            <PencilIcon width="24" height="24" />
            <span className="hidden md:block">Create</span>
          </a>
        </li>
      </ul>
    );
  }

  return (
    <ul className="mt-8 flex flex-col items-center gap-4 md:mt-12 md:items-stretch">
      <li>
        <a
          href="#"
          className="flex items-center justify-start gap-6 rounded-full p-4 hover:bg-gray-200"
        >
          <Image
            src={profileImage}
            alt="profile picture"
            width="30"
            height="30"
            className="rounded-full"
          />
          <span className="hidden md:block">{username}</span>
        </a>
      </li>
      <NavigationItem Icon={HomeIcon} title="Home" />
      <NavigationItem Icon={MagnifyingGlassIcon} title="Search" />
      <li className="mt-2">
        <a
          href="#"
          className="flex items-center justify-center gap-6 rounded-full bg-gray-500 p-4 text-white hover:bg-gray-600"
        >
          <span className="hidden md:block">Register</span>
        </a>
      </li>
      <li>
        <a
          href="#"
          className="flex items-center justify-center gap-6 rounded-full bg-green-700 p-4 text-white hover:bg-green-800"
        >
          <PencilIcon width="24" height="24" />
          <span className="hidden md:block">Login</span>
        </a>
      </li>
    </ul>
  );
};

export default NavigationItemList;
