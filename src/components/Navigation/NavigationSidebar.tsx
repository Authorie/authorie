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
    <nav className="flex h-screen w-fit flex-col justify-center bg-white px-6 pt-10 text-xl shadow-xl ring-1 ring-gray-900/5 md:justify-start lg:px-8">
      <a href="#">
        <Image
          src="/authorie_logo.svg"
          alt="Authorie Logo"
          width="276"
          height="120"
          className="mx-auto hidden h-14 w-auto md:block"
        />
        <Image
          src="/authorie_logo_minified.svg"
          alt="Authorie Logo"
          width="30"
          height="12"
          className="mx-auto md:hidden"
        />
      </a>
      <NavigationItemList
        username={user.username}
        profileImage={user.profileImage}
        coin={user.coin}
      />
    </nav>
  );
};

export default NavigationSidebar;
