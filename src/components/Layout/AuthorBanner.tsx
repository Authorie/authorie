import UserCard from "@components/Card/UserCard";
import DialogLayout from "@components/Dialog/DialogLayout";
import LoadingSpinner from "@components/ui/LoadingSpinner";
import { zodResolver } from "@hookform/resolvers/zod";
import useImageUpload from "@hooks/imageUpload";
import type { RouterOutputs } from "@utils/api";
import { api } from "@utils/api";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { HiOutlinePencilSquare, HiOutlinePhoto } from "react-icons/hi2";
import * as z from "zod";

const AuthorTab = [
  { title: "HOME", url: "" },
  { title: "COMMUNITY", url: "community" },
  { title: "BOOK", url: "book" },
  { title: "ABOUT", url: "about" },
] as const;

const validationSchema = z.object({
  penname: z
    .string()
    .max(50, { message: "Your penname is too long" })
    .min(1, { message: "Your penname is required" }),
  bio: z.string().max(150, { message: "Your bio is too long" }),
});

const parseUserTab = (pathname: string | undefined) => {
  const tab = AuthorTab.find((t) => pathname?.includes(t.url));
  return tab || AuthorTab[0];
};

const getFollowedButtonClassName = (followed: boolean) => {
  if (followed) {
    return "w-24 h-7 rounded text-sm bg-blue-300 hover:bg-blue-400";
  } else {
    return "w-24 h-7 rounded bg-green-300 text-sm hover:bg-green-400";
  }
};

type props = {
  user: RouterOutputs["user"]["getData"] | undefined;
  penname: string;
};

const AuthorBanner = ({
  tab,
  user,
}: {
  tab: (typeof AuthorTab)[number];
  user: RouterOutputs["user"]["getData"];
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [openFollowers, setOpenFollowers] = useState(false);
  const [openFollowing, setOpenFollowing] = useState(false);
  const router = useRouter();
  const context = api.useContext();
  const { status, data: session } = useSession();
  const isOwner = useMemo(() => {
    return session?.user.id === user.id;
  }, [session?.user.id, user.id]);
  const { data: isFollowed, isLoading: queryLoading } =
    api.user.isFollowUser.useQuery(user.penname as string, {
      enabled: !isOwner && user.penname != null,
    });
  const { data: userFollowers, isLoading: loadingFollowers } =
    api.user.getFollowers.useInfiniteQuery(
      {
        limit: 7,
        penname: user.penname as string,
      },
      {
        getNextPageParam: (lastpage) => lastpage.nextCursor,
      }
    );
  const { data: userFollowing, isLoading: loadingFollowing } =
    api.user.getFollowing.useInfiniteQuery(
      {
        limit: 7,
        penname: user.penname as string,
      },
      {
        getNextPageParam: (lastpage) => lastpage.nextCursor,
      }
    );
  const {
    imageData: profileImage,
    uploadHandler: uploadProfileImageHandler,
    resetImageData: resetProfileImage,
  } = useImageUpload();
  const {
    imageData: wallpaperImage,
    uploadHandler: uploadWallpaperImageHandler,
    resetImageData: resetWallpaperImage,
  } = useImageUpload();
  const {
    register,
    reset,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      penname: user.penname || "",
      bio: user.bio,
    },
  });

  const updateProfile = api.user.update.useMutation({
    onSuccess: () => {
      void context.user.getData.invalidate(undefined);
    },
  });
  const followUserMutation = api.user.followUser.useMutation({
    onMutate: async () => {
      await context.user.isFollowUser.cancel();
      const previousFollow = context.user.isFollowUser.getData();
      context.user.isFollowUser.setData(user.id, (old) => !old);
      return { previousFollow };
    },
    onSettled: () => {
      void context.user.invalidate();
    },
  });
  const unfollowUserMutation = api.user.unfollowUser.useMutation({
    onMutate: async () => {
      await context.user.isFollowUser.cancel();
      const previousFollow = context.user.isFollowUser.getData();
      context.user.isFollowUser.setData(user.id, (old) => !old);
      return { previousFollow };
    },
    onSettled: () => {
      void context.user.invalidate();
    },
  });

  const followButtonOnClickHandler = useCallback(() => {
    if (!user) return;
    if (isOwner) return;
    if (Boolean(isFollowed)) {
      unfollowUserMutation.mutate(user.id);
    } else {
      followUserMutation.mutate(user.id);
    }
  }, [followUserMutation, isFollowed, isOwner, unfollowUserMutation, user]);

  const onFollowHandler = (userId: string) => {
    if (!user) return;
    if (session?.user.id === userId) return;
    followUserMutation.mutate(userId);
  };

  const onUnfollowHandler = (userId: string) => {
    if (!user) return;
    if (session?.user.id === userId) {
      return;
    }
    unfollowUserMutation.mutate(userId);
  };

  const onCancelHandler = () => {
    reset();
    resetProfileImage();
    resetWallpaperImage();
    setIsEditing(false);
  };

  const uploadImage = api.upload.uploadImage.useMutation();

  const onSubmitHandler = handleSubmit(async ({ penname, bio }) => {
    let profileImageUrl;
    let wallpaperImageUrl;
    const urlParser = z.string().url();
    if (profileImage && !urlParser.safeParse(profileImage).success) {
      profileImageUrl = await uploadImage.mutateAsync({
        image: profileImage,
      });
    }
    if (wallpaperImage && !urlParser.safeParse(wallpaperImage).success) {
      wallpaperImageUrl = await uploadImage.mutateAsync({
        image: wallpaperImage,
      });
    }

    const promise = updateProfile.mutateAsync(
      {
        penname,
        bio,
        profileImageUrl,
        wallpaperImageUrl,
      },
      {
        onSuccess(data) {
          if (data.penname) {
            void router.replace(`/${data.penname}/${tab.url}`);
          }
          setIsEditing(false);
        },
      }
    );
    await toast.promise(promise, {
      loading: "Updating profile...",
      success: "Profile updated!",
      error: "Failed to update profile",
    });
  });

  return (
    <>
      <label
        htmlFor="upload-wallpaper"
        className={`absolute inset-0 h-72 ${isEditing ? "cursor-pointer" : ""}`}
      >
        {isEditing && (
          <div>
            <input
              hidden
              type="file"
              accept="image/jpeg, image/png"
              name="upload-wallpaper"
              id="upload-wallpaper"
              onChange={uploadWallpaperImageHandler}
            />
            <HiOutlinePhoto className="absolute left-2 top-2 z-10 h-7 w-7 rounded-lg bg-black p-1 text-white" />
          </div>
        )}
        {user.wallpaperImage || wallpaperImage !== "" ? (
          <Image
            src={
              wallpaperImage !== ""
                ? wallpaperImage
                : (user.wallpaperImage as string)
            }
            alt="wallpaper"
            priority
            fill
            className={isEditing ? "opacity-90" : ""}
          />
        ) : (
          <div
            className={`${
              isEditing ? "opacity-90" : ""
            } h-full w-full bg-authGreen-400`}
          />
        )}
      </label>
      <form
        onSubmit={(e) => void onSubmitHandler(e)}
        className="ml-40 h-full max-w-xl bg-black/50 px-7 pt-7 backdrop-blur-lg"
      >
        <div className="flex justify-between">
          <label
            htmlFor="upload-profile"
            className={`${
              isEditing ? "cursor-pointer" : ""
            } relative mb-3 flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border`}
          >
            {isEditing && (
              <div>
                <HiOutlinePhoto className="absolute left-4 top-4 z-10 h-7 w-7 rounded-lg bg-black p-1 text-white" />
                <input
                  hidden
                  type="file"
                  accept="image/jpeg, image/png"
                  name="upload-profile"
                  id="upload-profile"
                  onChange={uploadProfileImageHandler}
                />
              </div>
            )}
            <Image
              src={
                profileImage === ""
                  ? user.image || "/placeholder_profile.png"
                  : profileImage
              }
              alt="profile picture"
              width="250"
              height="250"
              className={isEditing ? "absolute z-0 opacity-90" : "absolute z-0"}
            />
          </label>
          <div>
            {isOwner && (
              <div className="w-fit">
                {isEditing ? (
                  <div className="flex gap-3">
                    <button
                      onClick={onCancelHandler}
                      className="rounded-xl border-2 border-red-400 px-5 py-1 text-red-400 hover:border-red-600 hover:text-red-600"
                    >
                      cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl border-2 border-green-400 px-5 py-1 text-green-400 hover:border-green-600 hover:text-green-600"
                    >
                      save
                    </button>
                  </div>
                ) : (
                  <HiOutlinePencilSquare
                    onClick={() => setIsEditing(true)}
                    className="h-6 w-6 cursor-pointer text-white hover:text-gray-500"
                  />
                )}
              </div>
            )}
          </div>
        </div>
        <div className="mb-2 flex items-center justify-between">
          <div className="h-fit">
            {isEditing ? (
              <div className="w-full">
                <div className="flex items-end gap-2">
                  <input
                    placeholder={user.penname as string}
                    className="w-full rounded-lg border border-gray-400 bg-transparent px-2 text-2xl font-bold text-white placeholder-gray-400 outline-none focus:outline-none"
                    {...register("penname")}
                  />
                  <p
                    className={`${"text-xs"} 
                          ${
                            watch("penname") && watch("penname").length > 50
                              ? "text-red-500"
                              : "text-white"
                          }`}
                  >
                    {watch("penname") ? watch("penname").length : 0}
                    /50
                  </p>
                </div>
                {errors.penname && (
                  <p className="text-xs text-red-400" role="alert">
                    {errors.penname.message}
                  </p>
                )}
              </div>
            ) : (
              <h2 className="text-2xl font-bold text-white">{user.penname}</h2>
            )}
          </div>
          {status === "authenticated" && !isOwner && (
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
          <div
            className="cursor-pointer"
            onClick={() => setOpenFollowers(true)}
          >
            <span className="font-semibold">{user._count.followers}</span>{" "}
            followers
          </div>
          <DialogLayout
            isOpen={openFollowers}
            closeModal={() => setOpenFollowers(false)}
            title={"Followers"}
          >
            {
              <div>
                {userFollowers && !loadingFollowers ? (
                  userFollowers?.pages
                    .flatMap((page) => page.items)
                    .map((user) => (
                      <UserCard
                        key={user.id}
                        penname={user.penname as string}
                        image={user.image || undefined}
                        followersNumber={user._count.followers}
                        followingNumber={user._count.following}
                        userId={user.id}
                        followUser={(userId) => onFollowHandler(userId)}
                        unfollowUser={(userId) => onUnfollowHandler(userId)}
                      />
                    ))
                ) : (
                  <div>loading follower...</div>
                )}
                {userFollowers?.pages.flatMap((page) => page.items).length ===
                  0 && (
                  <div className="flex w-96 items-center justify-center">
                    <p className="text-lg">No followers</p>
                  </div>
                )}
              </div>
            }
          </DialogLayout>
          <div
            className="cursor-pointer"
            onClick={() => setOpenFollowing(true)}
          >
            <span className="font-semibold">{user._count.following}</span>{" "}
            following
          </div>
          <DialogLayout
            isOpen={openFollowing}
            closeModal={() => setOpenFollowing(false)}
            title={"Following"}
          >
            <div className="w-fit">
              {
                <div>
                  {userFollowing && !loadingFollowing ? (
                    userFollowing?.pages
                      .flatMap((page) => page.items)
                      .map((user) => (
                        <UserCard
                          key={user.id}
                          penname={user.penname as string}
                          image={user.image || undefined}
                          followersNumber={user._count.followers}
                          followingNumber={user._count.following}
                          userId={user.id}
                          followUser={(userId) => onFollowHandler(userId)}
                          unfollowUser={(userId) => onUnfollowHandler(userId)}
                        />
                      ))
                  ) : (
                    <div>loading following...</div>
                  )}
                  {userFollowing?.pages.flatMap((page) => page.items).length ===
                    0 && (
                    <div className="flex w-96 items-center justify-center">
                      <p className="text-lg">No following</p>
                    </div>
                  )}
                </div>
              }
            </div>
          </DialogLayout>
        </div>
        <div className="h-fit w-4/5 pb-2 text-sm text-white">
          {isEditing ? (
            <div className="h-16S">
              <div className="flex items-end gap-2">
                <textarea
                  rows={2}
                  placeholder={user.bio === "" ? "Put bio here" : user.bio}
                  {...register("bio")}
                  className="w-full resize-none rounded-lg border border-gray-400 bg-transparent px-1.5 placeholder-gray-400 outline-none"
                />
                <p
                  className={`${"text-xs"} 
                          ${
                            watch("bio") && watch("bio").length > 150
                              ? "text-red-500"
                              : "text-white"
                          }`}
                >
                  {watch("bio") ? watch("bio").length : 0}/150
                </p>
              </div>
              {errors.bio && (
                <p className="text-xs text-red-400" role="alert">
                  {errors.bio.message}
                </p>
              )}
            </div>
          ) : (
            <p>{user.bio}</p>
          )}
        </div>
      </form>
    </>
  );
};

const AuthorBannerContainer = ({ user, penname }: props) => {
  const router = useRouter();
  const tab = useMemo(
    () => parseUserTab(router.pathname.split("/")[2]),
    [router.pathname]
  );

  return (
    <>
      <div className="relative h-fit min-w-full">
        {user ? (
          <AuthorBanner tab={tab} user={user} />
        ) : (
          <div className="ml-40 grid h-full max-w-xl items-center justify-center bg-black/80 px-7 pt-7 backdrop-blur-lg">
            <LoadingSpinner />
          </div>
        )}
      </div>
      <div className="sticky top-0 z-20 ml-40 w-fit self-start">
        <div className="flex max-w-xl items-center justify-between bg-black/60 px-1 shadow-lg backdrop-blur-lg">
          {AuthorTab.map((data) => (
            <button
              key={data.title}
              onClick={() => void router.push(`/${penname}/${data.url}`)}
              className={`
                ${
                  router.pathname.includes(data.title.toLocaleLowerCase()) ||
                  (data.title === "HOME" &&
                    router.pathname.split("/")[2] == null)
                    ? "text-green-500 underline decoration-green-500 underline-offset-2"
                    : "cursor-pointer text-white"
                } ${"select-none px-11 py-3 text-sm hover:bg-black/30"}`}
            >
              {data.title}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default AuthorBannerContainer;
