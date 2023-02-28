import Image from "next/legacy/image";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { useRouter } from "next/router";

type props = {
  penname: string | undefined;
  bio: string | undefined;
  followers: number | undefined;
  following: number | undefined;
  followed: boolean;
};

const AuthorTab: { title: string; url: string }[] = [
  { title: "HOME", url: "/" },
  { title: "COMMUNITY", url: "/community" },
  { title: "BOOK", url: "/books" },
  { title: "ABOUT", url: "/about" },
];

const UserBanner = ({
  penname,
  bio,
  followers,
  following,
  followed,
}: props) => {
  const [followedUser, setFollowedUser] = useState<boolean>(followed);
  const [selectedTab, setSelectedTab] = useState("HOME");
  const router = useRouter();

  const onFollowHandler = () => {
    setFollowedUser(() => !followedUser);
  };

  let followedButtonClassName =
    "w-24 h-7 rounded bg-green-300 text-sm hover:bg-green-400";
  if (!followedUser === true) {
    followedButtonClassName =
      "w-24 h-7 rounded text-sm bg-blue-300 hover:bg-blue-400";
  }

  const onClickHandler = (title: string, url: string) => {
    const { penname } = router.query;
    setSelectedTab(title);
    router.replace(`/${penname}${url}`);
  };

  const tabClassName = (title: string) => {
    const { penname } = router.query;
    if (title != selectedTab) {
      return "text-white cursor-pointer text-sm";
    } else {
      return "text-green-500 text-sm underline underline-offset-4 decoration-green-500";
    }
  };

  return (
    <>
      <div className="relative min-w-full">
        <div className="absolute h-[22rem] min-w-full">
          <Image src="/mockWallpaper.jpeg" layout="fill" />
        </div>
        <div className="ml-40 max-w-xl bg-black/60 px-7 pb-1 pt-7 shadow-lg backdrop-blur-md">
          <div className="flex h-32 w-32 items-center overflow-hidden rounded-full">
            <Image
              src="/favicon.ico"
              alt="profile picture"
              width="250"
              height="250"
            />
          </div>
          <div className="mt-5 mb-2 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">{penname}</h1>
            <div className="flex items-center gap-2">
              <EnvelopeIcon className="w-10 text-white" />
              <button
                onClick={onFollowHandler}
                className={followedButtonClassName}
              >
                {followedUser ? "Followed" : "Follow"}
              </button>
            </div>
          </div>
          <div className="mb-4 flex gap-20 text-white">
            <p>
              <span className="font-semibold">{followers}</span> followers
            </p>
            <p>
              <span className="font-semibold">{following}</span> following
            </p>
          </div>
          <p className="mb-5 max-h-24 w-4/5 text-sm text-white">{bio}</p>
        </div>
      </div>
      <div className="sticky top-0 z-40 min-w-full">
        <div className="ml-40 flex max-w-xl justify-between bg-black/60 px-7 py-3 shadow-lg backdrop-blur-md">
          {AuthorTab.map((data) => (
            <button
              onClick={() => onClickHandler(data.title, data.url)}
              className={tabClassName(data.title)}
            >
              {data.title}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default UserBanner;
