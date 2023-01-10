import Image from "next/image";
import NavigationItem from "./NavigationItem";
import {
  BellIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  HeartIcon,
  HomeIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

interface Props {
  username: string;
  profileImage: string;
  coin: number;
}

const NavigationItemList = ({ username, profileImage, coin }: Props) => {
  return (
    <ul className="mt-20 flex flex-col gap-4 px-2">
      <li className="rounded-full py-4 hover:bg-gray-200">
        <a href="#" className="flex items-center justify-start gap-6 px-3">
          <Image
            src={profileImage}
            alt="profile picture"
            width="30"
            height="30"
            className="rounded-full"
          />
          <span>{username}</span>
        </a>
      </li>
      <NavigationItem Icon={HomeIcon} title="Home" />
      <NavigationItem Icon={HeartIcon} title="Favorites" />
      <NavigationItem Icon={BellIcon} title="Notification" />
      <NavigationItem Icon={ChatBubbleOvalLeftEllipsisIcon} title="Messages" />
      <NavigationItem Icon={MagnifyingGlassIcon} title="Search" />
      <li className="rounded-full py-4 hover:bg-gray-200">
        <a
          href="#"
          className="flex items-center justify-start gap-6 px-3 text-amber-400"
        >
          <Image
            src="/authorie_coin_logo.svg"
            alt="Authorie coin logo"
            width="30"
            height="30"
            className="fill-amber-400"
          />
          <span className="hidden sm:block">{coin} Au</span>
        </a>
      </li>
    </ul>
  );
};

export default NavigationItemList;
