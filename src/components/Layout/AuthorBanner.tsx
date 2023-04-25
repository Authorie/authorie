import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { HiOutlinePencilSquare, HiOutlinePhoto } from "react-icons/hi2";
import TextareaAutoSize from "react-textarea-autosize";
import z from "zod";
import UserCard from "~/components/Card/UserCard";
import DialogLayout from "~/components/Dialog/DialogLayout";
import useImageUpload from "~/hooks/imageUpload";
import type { RouterOutputs } from "~/utils/api";
import { api } from "~/utils/api";
import UserCardSkeleton from "../Card/UserCardSkeleton";
import { useRouter } from "next/router";
import { AuthorTab } from "./AuthorBannerContainer";

const validationSchema = z.object({
  penname: z
    .string()
    .max(50, { message: "Your penname is too long" })
    .min(1, { message: "Your penname is required" }),
  bio: z.string().max(150, { message: "Your bio is too long" }),
});

const getFollowedButtonClassName = (followed: boolean) => {
  if (followed) {
    return "w-24 h-7 rounded text-sm bg-blue-300 hover:bg-blue-400";
  } else {
    return "w-24 h-7 rounded bg-green-300 text-sm hover:bg-green-400";
  }
};

const AuthorBanner = ({
  tab,
  user,
  penname,
}: {
  tab: AuthorTab;
  penname: string;
  user: RouterOutputs["user"]["getData"];
}) => {
  const router = useRouter();
  const utils = api.useContext();
  const { status, data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [openFollowers, setOpenFollowers] = useState(false);
  const [openFollowing, setOpenFollowing] = useState(false);
  const followings = api.useQueries((t) =>
    user.following.map(({ followingId }) => t.user.getData({ id: followingId }))
  );
  const followingsLoading = followings.some((following) => following.isLoading);
  const followers = api.useQueries((t) =>
    user.followers.map(({ followerId }) => t.user.getData({ id: followerId }))
  );
  const followersLoading = followers.some((follower) => follower.isLoading);
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
      penname: user.penname ?? "",
      bio: user.bio ?? "",
    },
  });

  const updateProfile = api.user.update.useMutation({
    async onMutate(variables) {
      await utils.user.getData.cancel(undefined);
      await utils.user.getData.cancel({
        penname: variables.penname ? variables.penname : session!.user.penname!,
      });
      const prevData = utils.user.getData.getData(undefined);
      utils.user.getData.setData(undefined, (old) => {
        if (!old) return old;
        return {
          ...old,
          penname: variables.penname ? variables.penname : old.penname,
          bio: variables.bio ? variables.bio : old.bio,
          image: variables.profileImageUrl
            ? variables.profileImageUrl
            : old.image,
          wallpaperImage: variables.wallpaperImageUrl
            ? variables.wallpaperImageUrl
            : old.wallpaperImage,
          description: variables.description
            ? variables.description
            : old.description,
          location: variables.location ? variables.location : old.location,
          facebookContact: variables.facebookContact
            ? variables.facebookContact
            : old.facebookContact,
          instagramContact: variables.instagramContact
            ? variables.instagramContact
            : old.instagramContact,
          emailContact: variables.emailContact
            ? variables.emailContact
            : old.emailContact,
        };
      });
      utils.user.getData.setData(
        {
          penname: variables.penname
            ? variables.penname
            : session!.user.penname!,
        },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            penname: variables.penname ? variables.penname : old.penname,
            bio: variables.bio ? variables.bio : old.bio,
            image: variables.profileImageUrl
              ? variables.profileImageUrl
              : old.image,
            wallpaperImage: variables.wallpaperImageUrl
              ? variables.wallpaperImageUrl
              : old.wallpaperImage,
            description: variables.description
              ? variables.description
              : old.description,
            location: variables.location ? variables.location : old.location,
            facebookContact: variables.facebookContact
              ? variables.facebookContact
              : old.facebookContact,
            instagramContact: variables.instagramContact
              ? variables.instagramContact
              : old.instagramContact,
            emailContact: variables.emailContact
              ? variables.emailContact
              : old.emailContact,
          };
        }
      );
      return { prevData };
    },
    onError(_error, variables, context) {
      if (context?.prevData) {
        utils.user.getData.setData(undefined, context.prevData);
        utils.user.getData.setData(
          {
            penname: variables.penname
              ? variables.penname
              : session!.user.penname!,
          },
          context.prevData
        );
      }
    },
    onSettled(_data, _error, variables, _context) {
      void utils.user.getData.invalidate(undefined);
      void utils.user.getData.invalidate({
        penname: variables.penname ? variables.penname : session!.user.penname!,
      });
    },
    async onSuccess(_data, variables, _context) {
      if (variables.penname) {
        await router.replace(`/${variables.penname}/${tab.url}`);
      }
      reset({
        penname: variables.penname ? variables.penname : user.penname!,
        bio: variables.bio ? variables.bio : user.bio ?? "",
      });
      setIsEditing(false);
    },
  });
  const followUserMutation = api.user.followUser.useMutation({
    async onMutate(variables) {
      await utils.user.getData.cancel({ id: variables });
      if (variables === user.id) await utils.user.getData.cancel({ penname });
      const prevData = utils.user.getData.getData({ penname });
      const prevFollowedUserData = utils.user.getData.getData({
        id: variables,
      });
      utils.user.getData.setData({ id: variables }, (old) => {
        if (!old) return old;
        return {
          ...old,
          isFollowing: true,
          followers: [...old.followers, { followerId: session!.user.id }],
        };
      });
      if (variables === user.id) {
        utils.user.getData.setData({ penname }, (old) => {
          if (!old) return old;
          return {
            ...old,
            isFollowing: true,
            following: [...old.following, { followingId: session!.user.id }],
          };
        });
      }
      return { prevData, prevFollowedUserData };
    },
    onError(_error, variables, context) {
      if (context?.prevData) {
        utils.user.getData.setData({ penname }, context.prevData);
      }
      if (context?.prevFollowedUserData) {
        utils.user.getData.setData(
          { id: variables },
          context.prevFollowedUserData
        );
      }
    },
    onSettled(_data, _error, variables, _context) {
      void utils.user.getData.invalidate({ penname });
      void utils.user.getData.invalidate({ id: variables });
    },
  });
  const unfollowUserMutation = api.user.unfollowUser.useMutation({
    async onMutate(variables) {
      await utils.user.getData.cancel({ id: variables });
      if (variables === user.id) await utils.user.getData.cancel({ penname });
      const prevData = utils.user.getData.getData({ penname });
      const prevFollowedUserData = utils.user.getData.getData({
        id: variables,
      });
      utils.user.getData.setData({ id: variables }, (old) => {
        if (!old) return old;
        return {
          ...old,
          isFollowing: false,
          followers: old.followers.filter(
            ({ followerId }) => followerId !== session!.user.id
          ),
        };
      });
      if (variables === user.id) {
        utils.user.getData.setData({ penname }, (old) => {
          if (!old) return old;
          return {
            ...old,
            isFollowing: false,
            following: old.following.filter(
              ({ followingId }) => followingId !== session!.user.id
            ),
          };
        });
      }
      return { prevData, prevFollowedUserData };
    },
    onError(_error, variables, context) {
      if (context?.prevData) {
        utils.user.getData.setData({ penname }, context.prevData);
      }
      if (context?.prevFollowedUserData) {
        utils.user.getData.setData(
          { id: variables },
          context.prevFollowedUserData
        );
      }
    },
    onSettled(_data, _error, variables, _context) {
      void utils.user.getData.invalidate({ penname });
      void utils.user.getData.invalidate({ id: variables });
    },
  });

  const followButtonOnClickHandler = () => {
    if (user.isOwner) return;
    if (user.isFollowing) {
      unfollowUserMutation.mutate(user.id);
    } else {
      followUserMutation.mutate(user.id);
    }
  };
  const onFollowHandler = (userId: string) => {
    if (session?.user.id === userId) return;
    followUserMutation.mutate(userId);
  };

  const onUnfollowHandler = (userId: string) => {
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
    const urlParser = z.string().startsWith("data:image");
    if (profileImage && urlParser.safeParse(profileImage).success) {
      profileImageUrl = await uploadImage.mutateAsync({
        image: profileImage,
      });
    }
    if (wallpaperImage && urlParser.safeParse(wallpaperImage).success) {
      wallpaperImageUrl = await uploadImage.mutateAsync({
        image: wallpaperImage,
      });
    }

    const promise = updateProfile.mutateAsync({
      penname,
      bio,
      profileImageUrl,
      wallpaperImageUrl,
    });
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
        className={`absolute inset-0 h-72 overflow-hidden ${isEditing ? "cursor-pointer" : ""
          }`}
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
            src={wallpaperImage !== "" ? wallpaperImage : user.wallpaperImage!}
            alt="wallpaper"
            priority
            height={100}
            width={2000}
            className={isEditing ? "opacity-90" : ""}
          />
        ) : (
          <div
            className={`${isEditing ? "opacity-90" : ""
              } h-full w-full bg-authGreen-400`}
          />
        )}
      </label>
      <form
        onSubmit={(e) => void onSubmitHandler(e)}
        className="ml-40 max-w-xl bg-black/60 px-7 pt-7 backdrop-blur-lg"
      >
        <div className="mb-3 flex justify-between ">
          <label
            htmlFor="upload-profile"
            className={`${isEditing ? "cursor-pointer" : ""
              } relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border`}
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
            {user.isOwner && (
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
                    placeholder={user.penname!}
                    className="w-full rounded-lg border border-gray-400 bg-transparent px-2 text-2xl font-bold text-white placeholder-gray-400 outline-none focus:outline-none"
                    {...register("penname")}
                  />
                  <p
                    className={`${"text-xs"} 
                          ${watch("penname") && watch("penname").length > 50
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
          {status === "authenticated" && !user.isOwner && (
            <button
              type="button"
              onClick={followButtonOnClickHandler}
              disabled={
                followUserMutation.isLoading || unfollowUserMutation.isLoading
              }
              className={getFollowedButtonClassName(user.isFollowing)}
            >
              {user.isFollowing ? "Followed" : "Follow"}
            </button>
          )}
        </div>
        <div className="mb-3 flex gap-20 text-white">
          <div
            className="cursor-pointer"
            onClick={() => setOpenFollowers(true)}
          >
            <span className="font-semibold">{user.followers.length}</span>{" "}
            followers
          </div>
          <div
            className="cursor-pointer"
            onClick={() => setOpenFollowing(true)}
          >
            <span className="font-semibold">{user.following.length}</span>{" "}
            following
          </div>
        </div>
        <div className="h-fit w-4/5 pb-2 text-sm text-white">
          {isEditing ? (
            <div className="h-16">
              <div className="flex items-end gap-2">
                <TextareaAutoSize
                  rows={2}
                  placeholder={user.bio ? user.bio : "Put bio here..."}
                  {...register("bio")}
                  className="w-full resize-none rounded-lg border border-gray-400 bg-transparent px-1.5 placeholder-gray-400 outline-none"
                />
                <p
                  className={`${"text-xs"} 
                          ${(watch("bio") || "").length > 150
                      ? "text-red-500"
                      : "text-white"
                    }`}
                >
                  {(watch("bio") || "").length}/150
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
      <DialogLayout
        isOpen={openFollowers}
        closeModal={() => setOpenFollowers(false)}
        title={"Followers"}
      >
        {
          <div className="flex h-full flex-col gap-4 overflow-y-scroll">
            {!followersLoading ? (
              followers
                .map(({ data }) => data!)
                .map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    closeModal={() => setOpenFollowers(false)}
                    followUser={(userId) => onFollowHandler(userId)}
                    unfollowUser={(userId) => onUnfollowHandler(userId)}
                  />
                ))
            ) : (
              <UserCardSkeleton />
            )}
            {user.followers.length === 0 && (
              <div className="flex w-96 items-center justify-center">
                <p className="text-lg">No followers</p>
              </div>
            )}
          </div>
        }
      </DialogLayout>
      <DialogLayout
        isOpen={openFollowing}
        closeModal={() => setOpenFollowing(false)}
        title={"Following"}
      >
        {
          <div className="flex h-full flex-col gap-4 overflow-y-scroll">
            {!followingsLoading ? (
              followings
                .map(({ data }) => data!)
                .filter((following) => {
                  if (user.isOwner) {
                    return following.isFollowing;
                  }
                  return true;
                })
                .map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    closeModal={() => setOpenFollowers(false)}
                    followUser={(userId) => onFollowHandler(userId)}
                    unfollowUser={(userId) => onUnfollowHandler(userId)}
                  />
                ))
            ) : (
              <UserCardSkeleton />
            )}
            {user.following.length === 0 && (
              <div className="flex w-96 items-center justify-center">
                <p className="text-lg">No following</p>
              </div>
            )}
          </div>
        }
      </DialogLayout>
    </>
  );
};

export default AuthorBanner;
