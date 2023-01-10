import Image from "next/image";
import {
  BellIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  HeartIcon,
  HomeIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { PencilIcon } from "@heroicons/react/24/solid";

const NavigationBar = () => {
  return (
    <nav className="flex h-screen max-w-xs flex-col bg-white px-12 pt-10 pb-32 text-xl shadow-xl ring-1 ring-gray-900/5">
      <a href="#">
        <Image
          src="/authorie_logo.png"
          alt="Authorie Logo"
          width="276"
          height="120"
          className="mx-auto h-14 w-auto"
        />
      </a>
      <ul className="mt-20 flex grow flex-col space-y-12 ">
        <li>
          <a href="#" className="flex items-center gap-6">
            <Image
              src="https://thumbs.dreamstime.com/b/cute-cat-portrait-square-photo-beautiful-white-closeup-105311158.jpg"
              alt="profile picture"
              width="40"
              height="40"
              className="rounded-full"
            />
            <span>nongfameza</span>
          </a>
        </li>
        <li>
          <a href="#" className="flex items-center gap-6">
            <HomeIcon width="40" height="40" />
            <span>Home</span>
          </a>
        </li>
        <li>
          <a href="#" className="flex items-center gap-6">
            <HeartIcon width="40" height="40" />
            <span>Favorites</span>
          </a>
        </li>
        <li>
          <a href="#" className="flex items-center gap-6">
            <BellIcon width="40" height="40" />
            <span>Notification</span>
          </a>
        </li>
        <li>
          <a href="#" className="flex items-center gap-6">
            <ChatBubbleOvalLeftEllipsisIcon width="40" height="40" />
            <span>Messages</span>
          </a>
        </li>
        <li>
          <a href="#" className="flex items-center gap-6">
            <MagnifyingGlassIcon width="40" height="40" />
            <span>Search</span>
          </a>
        </li>
        <li>
          <a href="#" className="flex items-center gap-6 text-[#DCAE36]">
            <Image
              src="/authorie_coin_logo.svg"
              alt="Authorie coin logo"
              width="40"
              height="40"
            />
            <span>3120 Au</span>
          </a>
        </li>
      </ul>
      <a
        href="#"
        className="mx-auto flex items-center gap-8 rounded-full bg-[#718F6B] px-8 py-4 text-white"
      >
        <PencilIcon width="30" height="30" />
        <span>Create</span>
      </a>
    </nav>
  );
};

export default NavigationBar;
