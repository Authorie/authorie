import { api } from "@utils/api";
import { useSession } from "next-auth/react";
import Image from "next/legacy/image";
import { useRouter } from "next/router";

type UserTab = "HOME" | "COMMUNITY" | "BOOK" | "ABOUT";

export const parseUserTab = (pathname: string | undefined) => {
  pathname = pathname?.toUpperCase();
  switch (pathname) {
    case "COMMUNITY":
    case "BOOK":
    case "ABOUT":
      return pathname as UserTab;
    default:
      return "HOME" as UserTab;
  }
};

const AuthorTab: { title: UserTab; url: string }[] = [
  { title: "HOME", url: "" },
  { title: "COMMUNITY", url: "community" },
  { title: "BOOK", url: "book" },
  { title: "ABOUT", url: "about" },
];

const getFollowedButtonClassName = (followed: boolean) => {
  if (followed) {
    return "w-24 h-7 rounded text-sm bg-blue-300 hover:bg-blue-400";
  } else {
    return "w-24 h-7 rounded bg-green-300 text-sm hover:bg-green-400";
  }
};

const UserBanner = () => {
  const context = api.useContext();
  const router = useRouter();
  const penname = router.query.penname as string;
  const tab = parseUserTab(router.pathname.split("/")[2]);
  const { status, data: session } = useSession();
  const { data: user } = api.user.getData.useQuery(penname);
  const { data: isFollowed, isLoading: queryLoading } =
    api.user.isFollowUser.useQuery(penname);
  const followUserMutation = api.user.followUser.useMutation({
    onSuccess: () => {
      void context.user.invalidate();
    },
  });
  const unfollowUserMutation = api.user.unfollowUser.useMutation({
    onSuccess: () => {
      void context.user.invalidate();
    },
  });

  const followButtonOnClickHandler = () => {
    if (!user) return;
    if (Boolean(isFollowed)) {
      unfollowUserMutation.mutate(user.id);
    } else {
      followUserMutation.mutate(user.id);
    }
  };

  const tabClassName = (title: UserTab) => {
    if (title !== tab) {
      return "text-white cursor-pointer text-sm select-none";
    } else {
      return "text-green-500 text-sm underline underline-offset-2 decoration-green-500 select-none";
    }
  };

  return (
    <>
      <div className="relative min-w-full">
        <div className="absolute h-80 w-full">
          <Image src="/mockWallpaper.jpeg" layout="fill" alt="wallpaper" />
        </div>
        <div className="ml-40 h-80 max-w-xl bg-black/60 px-7 pt-7 backdrop-blur-lg">
          <div className="mb-3 h-32 w-32 overflow-hidden rounded-full">
            <Image
              src="/favicon.ico"
              alt="profile picture"
              width="250"
              height="250"
            />
          </div>
          <div className="mb-2 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">{penname}</h1>
            {status === "authenticated" && user?.id != session.user.id && (
              <button
                type="button"
                onClick={followButtonOnClickHandler}
                disabled={
                  queryLoading ||
                  followUserMutation.isLoading ||
                  unfollowUserMutation.isLoading
                }
                className={getFollowedButtonClassName(Boolean(isFollowed))}
              >
                {Boolean(isFollowed) ? "Followed" : "Follow"}
              </button>
            )}
          </div>
          <div className="mb-3 flex gap-20 text-white">
            <p>
              <span className="font-semibold">
                {user?._count.followers || 0}
              </span>{" "}
              followers
            </p>
            <p>
              <span className="font-semibold">
                {user?._count.following || 0}
              </span>{" "}
              following
            </p>
          </div>
          <p className="max-h-24 w-4/5 text-sm text-white">MOCK</p>
        </div>
      </div>
      <div className="sticky top-0 z-40 min-w-full">
        <div className="ml-40 flex max-w-xl items-center justify-between bg-black/60 px-7 py-3 shadow-lg backdrop-blur-lg">
          {AuthorTab.map((data) => (
            <button
              key={data.title}
              onClick={() => void router.push(`/${penname}/${data.url}`)}
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
