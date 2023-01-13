import Image from "next/image";
import NavigationItemList from "./NavigationItemList";
import Link from "next/link";

const user = {
  username: "nongfameza",
  profileImage:
    "https://thumbs.dreamstime.com/b/cute-cat-portrait-square-photo-beautiful-white-closeup-105311158.jpg",
  coin: 3120,
};

const NavigationSidebar = () => {
  return (
    <nav className="fixed top-0 bottom-0 flex min-h-screen w-fit flex-col justify-center overflow-y-auto bg-white px-4 pt-10 text-lg shadow-xl ring-1 ring-gray-900/5 md:justify-start lg:px-6">
      <Link href="/">
        <Image
          src="/authorie_logo.svg"
          alt="Authorie Logo"
          width="276"
          height="120"
          className="mx-auto hidden h-10 w-auto md:block"
        />
        <Image
          src="/authorie_logo_minified.svg"
          alt="Authorie Logo"
          width="30"
          height="12"
          className="mx-auto md:hidden"
        />
      </Link>
      <NavigationItemList
        username={user.username}
        profileImage={user.profileImage}
        coin={user.coin}
      />
    </nav>
  );
};

export default NavigationSidebar;
