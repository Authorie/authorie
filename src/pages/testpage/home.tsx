import Image from "next/image";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

function AuthorBanner({
  username,
  onlineStatus,
  profileImage,
  initialFollowStatus,
  authorDescription,
  followers,
  following,
}: {
  username: string;
  onlineStatus: boolean;
  profileImage: string;
  initialFollowStatus: boolean;
  authorDescription: string;
  followers: number;
  following: number;
}) {
  const [followStatus, setfollowStatus] = useState(initialFollowStatus);

  const router = useRouter();

  const pages = ["home", "community", "book", "about"];

  function handleFollow() {
    setfollowStatus(!followStatus);
  }

  return (
    <div className="flex w-min flex-col gap-6 bg-neutral-800/60 p-8 text-white shadow-lg backdrop-blur-md">
      <Image
        priority
        src={profileImage}
        className="h-52 w-52 rounded-full"
        height={144}
        width={144}
        alt={"Missing Image"}
      />
      <div className="flex items-center">
        <div className="w-max text-4xl font-bold">{username}</div>
        <div
          className={`mx-3 mt-3 h-5 w-5 rounded-full ${
            onlineStatus ? "bg-lime-300" : "bg-gray-300"
          }`}
        ></div>
        <button>
          <EnvelopeIcon className="ml-16 mr-7 h-16 w-16" />
        </button>
        <button
          className="w-24 rounded-md bg-lime-300 px-4 py-1 text-slate-800/60"
          onClick={handleFollow}
        >
          {followStatus ? "Followed" : "Follow"}
        </button>
      </div>
      <div className="">{authorDescription}</div>
      <div className="flex gap-6">
        <div className="font-bold">{followers} followers</div>
        <div className="font-bold">{following} following</div>
      </div>
      <ul className="flex justify-between gap-14">
        {pages.map((pagenames) => (
          <li key={pagenames}>
            <Link
              href={``}
              className={`${
                router.pathname.endsWith(pagenames)
                  ? "text-lime-300 underline"
                  : "hover:text-lime-300 hover:underline"
              } uppercase leading-5 underline-offset-4`}
            >
              {pagenames}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Testpage() {
  return (
    <div className="bg-[url('/favicon.ico')]">
      <AuthorBanner
        username={"Lorem napkin"}
        onlineStatus={false}
        profileImage={"/favicon.ico"}
        initialFollowStatus={false}
        authorDescription={
          "owner of the nine cats and the sentinel main, owner of the nine cats and the sentinel main"
        }
        followers={0}
        following={0}
      ></AuthorBanner>
    </div>
  );
}
