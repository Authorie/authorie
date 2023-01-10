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
    <nav className="flex h-screen w-fit flex-col bg-white px-8 pt-10 pb-16 text-2xl shadow-xl ring-1 ring-gray-900/5">
      <a href="#">
        <Image
          src="/authorie_logo.png"
          alt="Authorie Logo"
          width="276"
          height="120"
          className="mx-auto h-14 w-auto"
        />
      </a>
      <ul className="mt-20 flex flex-col space-y-6 px-2">
        <li className="rounded-full py-4 hover:bg-gray-200">
          <a href="#" className="flex items-center justify-start gap-6 px-3">
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
        <li className="rounded-full py-4 hover:bg-gray-200">
          <a href="#" className="flex items-center justify-start gap-6 px-3">
            <HomeIcon width="40" height="40" />
            <span>Home</span>
          </a>
        </li>
        <li className="rounded-full py-4 hover:bg-gray-200">
          <a href="#" className="flex items-center justify-start gap-6 px-3">
            <HeartIcon width="40" height="40" />
            <span>Favorites</span>
          </a>
        </li>
        <li className="rounded-full py-4 hover:bg-gray-200">
          <a href="#" className="flex items-center justify-start gap-6 px-3">
            <BellIcon width="40" height="40" />
            <span>Notification</span>
          </a>
        </li>
        <li className="rounded-full py-4 hover:bg-gray-200">
          <a href="#" className="flex items-center justify-start gap-6 px-3">
            <ChatBubbleOvalLeftEllipsisIcon width="40" height="40" />
            <span>Messages</span>
          </a>
        </li>
        <li className="rounded-full py-4 hover:bg-gray-200">
          <a href="#" className="flex items-center justify-start gap-6 px-3">
            <MagnifyingGlassIcon width="40" height="40" />
            <span>Search</span>
          </a>
        </li>
        <li className="rounded-full py-4 hover:bg-gray-200">
          <a
            href="#"
            className="flex items-center justify-start gap-6 px-3 text-amber-400"
          >
            <Image
              src="/authorie_coin_logo.svg"
              alt="Authorie coin logo"
              width="40"
              height="40"
              className="fill-amber-400"
            />
            <span>3120 Au</span>
          </a>
        </li>
      </ul>
      <a
        href="#"
        className="mt-auto flex justify-center gap-4 rounded-full bg-green-600 px-8 py-3 text-white hover:bg-green-700"
      >
        <PencilIcon width="24" height="24" />
        <span>Create</span>
      </a>
    </nav>
  );
};

export default NavigationBar;
