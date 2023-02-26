import Image from "next/legacy/image";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

type props = {
  penname: string | undefined;
  bio: string | undefined;
  followers: number | undefined;
  following: number | undefined;
  followed: boolean;
};

const AuthorTab: string[] = ["HOME", "COMMUNITY", "BOOK", "ABOUT"];

const UserBanner = ({
  penname,
  bio,
  followers,
  following,
  followed,
}: props) => {
  const [followedUser, setFollowedUser] = useState<boolean>(followed);
  const [selectedTab, setSelectedTab] = useState("HOME");

  const onFollowHandler = () => {
    setFollowedUser(() => !followedUser);
  };

  let followedButtonClassName =
    "w-24 h-7 rounded bg-green-300 hover:bg-green-400";
  if (!followedUser === true) {
    followedButtonClassName = "w-24 h-7 rounded bg-blue-300 hover:bg-blue-400";
  }

  const onClickHandler = (title: string) => {
    setSelectedTab(title);
  };

  const tabClassName = (title: string) => {
    if (title != selectedTab) {
      return "text-white cursor-pointer";
    } else {
      return "text-green-500 underline underline-offset-4 decoration-green-500";
    }
  };

  return (
    <div className="relative">
      <div className="absolute h-[22rem] w-full">
        <Image src="/mockWallpaper.jpeg" layout="fill" />
      </div>
      <div className="ml-40 max-w-xl bg-black/60 p-7 shadow-lg backdrop-blur-md">
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
        <div className="flex justify-between">
          {AuthorTab.map((data) => (
            <button
              onClick={() => onClickHandler(data)}
              className={tabClassName(data)}
            >
              {data}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserBanner;
