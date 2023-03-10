import { api } from "@utils/api";
import { useSession } from "next-auth/react";
import Image from "next/legacy/image";
import { useRouter } from "next/router";
import { PencilSquareIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";

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
  let penname = router.query.penname as string;
  const tab = parseUserTab(router.pathname.split("/")[2]);
  const { status, data: session } = useSession();
  const { data: user } = api.user.getData.useQuery(penname);
  const { data: isFollowed, isLoading: queryLoading } =
    api.user.isFollowUser.useQuery(penname);
  const [edit, setEdit] = useState(false);
  const [updatedPenname, setUpdatedPenname] = useState("");
  const [updatedBio, setUpdatedBio] = useState("");
  const [updatedImage, setUpdatedImage] = useState("");
  const updateProfile = api.user.update.useMutation({
    onSuccess: () => {
      void context.user.invalidate();
    },
  });

  useEffect(() => {
    setUpdatedPenname(user?.penname as string);
    setUpdatedImage(user?.image as string);
    console.log("check");
  }, [user?.image, user?.penname]);
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

  const onEditHandler = () => {
    setEdit(() => !edit);
  };

  const tabClassName = (title: UserTab) => {
    if (title !== tab) {
      return "text-white cursor-pointer text-sm select-none";
    } else {
      return "text-green-500 text-sm underline underline-offset-2 decoration-green-500 select-none";
    }
  };

  const onChangeImage = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const imageURL = window.URL.createObjectURL(e.target.files[0]);
      setUpdatedImage(imageURL);
      console.log("imageurl " + imageURL);
      URL.revokeObjectURL(imageURL);
      console.log("update image " + updatedImage);
    }
  };

  const onSaveHandler = () => {
    updateProfile.mutate({
      penname: updatedPenname,
      image: updatedImage,
      bio: updatedBio,
    });
    penname = updatedPenname;
    void router.push(`/${penname}`);
  };

  return (
    <>
      <div className="relative min-w-full">
        <div className="absolute h-80 w-full">
          <Image src="/mockWallpaper.jpeg" layout="fill" alt="wallpaper" />
        </div>
        <div className="ml-40 h-80 max-w-xl bg-black/60 px-7 pt-7 backdrop-blur-lg">
          <div className="flex justify-between">
            {!edit ? (
              <div className="mb-3 flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border">
                <Image
                  src={user?.image as string}
                  alt="profile picture"
                  width="250"
                  height="250"
                />
              </div>
            ) : (
              <div className="relative mb-3 flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border">
                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  className="absolute z-20 h-full w-full cursor-pointer opacity-0"
                  onChange={onChangeImage}
                />
                <PhotoIcon
                  width={25}
                  height={25}
                  className="absolute z-10 text-white"
                />
                <Image
                  src={updatedImage}
                  alt="profile picture"
                  width="250"
                  height="250"
                  className="absolute z-0 opacity-70"
                />
              </div>
            )}
            <div>
              <div onClick={onEditHandler} className="w-fit cursor-pointer">
                {!edit ? (
                  <PencilSquareIcon
                    width={25}
                    height={25}
                    className="text-white hover:text-gray-500"
                  />
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={onEditHandler}
                      className="rounded-xl border-2 border-red-500 px-5 py-1 text-red-500 hover:border-red-700 hover:text-red-700"
                    >
                      cancel
                    </button>
                    <button
                      onClick={onSaveHandler}
                      className="rounded-xl border-2 border-green-500 px-5 py-1 text-green-500 hover:border-green-700 hover:text-green-700"
                    >
                      save
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="mb-2 flex items-center justify-between">
            {!edit ? (
              <h1 className="text-2xl font-bold text-white">{penname}</h1>
            ) : (
              <input
                placeholder={updatedPenname}
                className="bg-transparent text-2xl text-white placeholder-gray-400 outline-none focus:outline-none"
                onChange={(e) => setUpdatedPenname(e.target.value)}
                value={updatedPenname}
              />
            )}
            {status === "authenticated" && user?.id !== session.user.id && (
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
          {!edit ? (
            <p className="max-h-24 w-4/5 text-sm text-white">MOCK</p>
          ) : (
            <input
              placeholder="MOCK"
              value={updatedBio}
              onChange={(e) => setUpdatedBio(e.target.value)}
              className="max-h-24 w-4/5 bg-transparent text-sm text-white placeholder-gray-400 outline-none focus:outline-none"
            />
          )}
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
