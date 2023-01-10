import Image from "next/image";

import { PencilIcon } from "@heroicons/react/24/solid";
import NavigationItemList from "./NavigationItemList";

const user = {
  username: "nongfameza",
  profileImage:
    "https://thumbs.dreamstime.com/b/cute-cat-portrait-square-photo-beautiful-white-closeup-105311158.jpg",
  coin: 3120,
};

const NavigationSidebar = () => {
  return (
    <nav className="flex h-screen w-fit flex-col bg-white px-6 pt-10 text-xl shadow-xl ring-1 ring-gray-900/5 lg:px-8">
      <a href="#">
        <Image
          src="/authorie_logo.png"
          alt="Authorie Logo"
          width="276"
          height="120"
          className="mx-auto h-14 w-auto"
        />
      </a>
      <NavigationItemList
        username={user.username}
        profileImage={user.profileImage}
        coin={user.coin}
      />
      <a
        href="#"
        className="mt-8 flex justify-center gap-4 rounded-full bg-green-600 px-8 py-3 text-white hover:bg-green-700"
      >
        <PencilIcon width="24" height="24" />
        <span className="hidden sm:block">Create</span>
      </a>
    </nav>
  );
};

export default NavigationSidebar;
