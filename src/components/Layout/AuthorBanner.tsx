import ErrorDialog from "@components/alert/ErrorDialog";
import LoadingSpinner from "@components/ui/LoadingSpinner";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import type { RouterOutputs } from "@utils/api";
import { api } from "@utils/api";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useCallback, useMemo, useReducer } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useImageUpload from "@hooks/imageUpload";
import * as z from "zod";
import { PhotoIcon } from "@heroicons/react/24/outline";

const AuthorTab = [
  { title: "HOME", url: "" },
  { title: "COMMUNITY", url: "community" },
  { title: "BOOK", url: "book" },
  { title: "ABOUT", url: "about" },
] as const;

const validationSchema = z.object({
  updatedPenname: z
    .string()
    .max(50, { message: "Your penname is too long" })
    .min(1, { message: "Your oenname is required" }),
  updatedBio: z.string().max(150, { message: "Your bio is too long" }),
});

type ValidationSchema = z.infer<typeof validationSchema>;

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

type UpdateAction =
  | {
      type: "toggle_edit";
    }
  | {
      type: "error_occured";
      payload: string;
    }
  | {
      type: "clear_error";
      payload: {
        penname: string;
      };
    };

type UpdateState = {
  isOwner: boolean;
  isEdit: boolean;
  error: string | false;
};

const updateReducer = (state: UpdateState, action: UpdateAction) => {
  if (!state.isOwner) {
    console.error("You are not owner of this profile");
    return state;
  }
  switch (action.type) {
    case "toggle_edit":
      return { ...state, isEdit: !state.isEdit };
    case "error_occured":
      return { ...state, error: action.payload };
    case "clear_error":
      return {
        ...state,
        error: false as const,
        penname: action.payload.penname,
      };
    default:
      console.error("Invalid action type", action);
      return state;
  }
};

const AuthorBanner = ({
  tab,
  user,
}: {
  tab: (typeof AuthorTab)[number];
  user: RouterOutputs["user"]["getData"];
}) => {
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
  } = useForm<ValidationSchema>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      updatedPenname: user.penname as string,
      updatedBio: user.bio,
    },
  });

  const [form, formDispatch] = useReducer(updateReducer, {
    isOwner,
    isEdit: false,
    error: false,
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
  const toggleIsEditHandler = useCallback(() => {
    formDispatch({ type: "toggle_edit" });
  }, []);

  const onCancelHandler = () => {
    reset();
    resetProfileImage();
    resetWallpaperImage();
    toggleIsEditHandler();
  };

  const uploadImage = api.upload.uploadImage.useMutation();

  const onSubmitHandler: SubmitHandler<ValidationSchema> = useCallback(
    async (data) => {
      let profileImageUrl;
      let wallpaperImageUrl;
      if (profileImage) {
        profileImageUrl = await uploadImage.mutateAsync({
          image: profileImage,
          title: `${user.penname as string}'s profile image`,
        });
      } else {
        profileImageUrl = user.image;
      }
      if (wallpaperImage) {
        wallpaperImageUrl = await uploadImage.mutateAsync({
          image: wallpaperImage,
          title: `${user.penname as string}'s wallpaper image`,
        });
      } else {
        wallpaperImageUrl = user.wallpaperImage;
      }

      updateProfile.mutate(
        {
          penname: data.updatedPenname,
          bio: data.updatedBio,
          profileImageUrl: profileImageUrl as string,
          wallpaperImageUrl: wallpaperImageUrl as string,
        },
        {
          onSuccess(data) {
            if (data.penname) {
              void router.replace(`/${data.penname}/${tab.url}`);
            }
            formDispatch({ type: "toggle_edit" });
          },
          onError(err) {
            formDispatch({
              type: "error_occured",
              payload: err.message,
            });
          },
        }
      );
    },
    [
      router,
      tab.url,
      updateProfile,
      profileImage,
      wallpaperImage,
      user.penname,
      uploadImage,
      user.image,
      user.wallpaperImage,
    ]
  );

  return (
    <>
      <ErrorDialog
        isOpen={form.error !== false}
        content={form.error !== false ? form.error : undefined}
        isCloseHandler={() =>
          formDispatch({
            type: "clear_error",
            payload: { penname: user.penname as string },
          })
        }
      />
      <label
        htmlFor="upload-wallpaper"
        className={`absolute inset-0 h-72 ${
          form.isEdit ? "cursor-pointer" : ""
        }`}
      >
        {form.isEdit && (
          <div>
            <input
              hidden
              type="file"
              accept="image/jpeg, image/png"
              name="upload-wallpaper"
              id="upload-wallpaper"
              onChange={uploadWallpaperImageHandler}
            />
            <PhotoIcon className="absolute left-2 top-2 z-10 h-7 w-7 rounded-lg bg-black p-1 text-white" />
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
            className={form.isEdit ? "opacity-90" : ""}
          />
        ) : (
          <div
            className={`${
              form.isEdit ? "opacity-90" : ""
            } h-full w-full bg-authGreen-400`}
          />
        )}
      </label>
      <form
        onSubmit={(e) => void handleSubmit(onSubmitHandler)(e)}
        className="ml-40 h-full max-w-xl bg-black/80 px-7 pt-7 backdrop-blur-lg"
      >
        <div className="flex justify-between">
          <label
            htmlFor="upload-profile"
            className={`${
              form.isEdit ? "cursor-pointer" : ""
            } relative mb-3 flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border`}
          >
            {form.isEdit && (
              <div>
                <PhotoIcon className="absolute left-4 top-4 z-10 h-7 w-7 rounded-lg bg-black p-1 text-white" />
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
              className={
                form.isEdit ? "absolute z-0 opacity-90" : "absolute z-0"
              }
            />
          </label>
          <div>
            {isOwner && (
              <div className="w-fit">
                {form.isEdit ? (
                  <div className="flex gap-3">
                    <button
                      onClick={onCancelHandler}
                      className="rounded-xl border-2 border-red-500 px-5 py-1 text-red-500 hover:border-red-700 hover:text-red-700"
                    >
                      cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl border-2 border-green-500 px-5 py-1 text-green-500 hover:border-green-700 hover:text-green-700"
                    >
                      save
                    </button>
                  </div>
                ) : (
                  <PencilSquareIcon
                    width={25}
                    height={25}
                    onClick={toggleIsEditHandler}
                    className="cursor-pointer text-white hover:text-gray-500"
                  />
                )}
              </div>
            )}
          </div>
        </div>
        <div className="mb-2 flex items-center justify-between">
          <div className="h-fit">
            {form.isEdit ? (
              <div className="w-full">
                <div className="flex items-end gap-2">
                  <input
                    placeholder={user.penname as string}
                    className="w-full rounded-lg border border-gray-400 bg-transparent px-2 text-2xl font-bold text-white placeholder-gray-400 outline-none focus:outline-none"
                    {...register("updatedPenname")}
                  />
                  <p
                    className={`${"text-xs"} 
                          ${
                            watch("updatedPenname") &&
                            watch("updatedPenname").length > 50
                              ? "text-red-500"
                              : "text-white"
                          }`}
                  >
                    {watch("updatedPenname")
                      ? watch("updatedPenname").length
                      : 0}
                    /50
                  </p>
                </div>
                {errors.updatedPenname && (
                  <p className="text-xs text-red-400" role="alert">
                    {errors.updatedPenname.message}
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
          <p>
            <span className="font-semibold">{user._count.followers}</span>{" "}
            followers
          </p>
          <p>
            <span className="font-semibold">{user._count.following}</span>{" "}
            following
          </p>
        </div>
        <div className="h-fit w-4/5 pb-2 text-sm text-white">
          {form.isEdit ? (
            <div className="h-16S">
              <div className="flex items-end gap-2">
                <textarea
                  rows={2}
                  placeholder={user.bio === "" ? "Put bio here" : user.bio}
                  {...register("updatedBio")}
                  className="w-full resize-none rounded-lg border border-gray-400 bg-transparent px-1.5 placeholder-gray-400 outline-none"
                />
                <p
                  className={`${"text-xs"} 
                          ${
                            watch("updatedBio") &&
                            watch("updatedBio").length > 150
                              ? "text-red-500"
                              : "text-white"
                          }`}
                >
                  {watch("updatedBio") ? watch("updatedBio").length : 0}/150
                </p>
              </div>
              {errors.updatedBio && (
                <p className="text-xs text-red-400" role="alert">
                  {errors.updatedBio.message}
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
      <div className="sticky top-0 z-40 ml-40 w-fit self-start">
        <div className="flex max-w-xl items-center justify-between bg-black/80 px-1 shadow-lg backdrop-blur-lg">
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
