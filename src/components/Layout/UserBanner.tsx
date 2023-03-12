import LoadingSpinner from "@components/ui/LoadingSpinner";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import type { RouterOutputs } from "@utils/api";
import { api } from "@utils/api";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useCallback, useMemo, useReducer } from "react";
import ErrorDialog from "@components/Error/ErrorDialog";

type UserTab = "HOME" | "COMMUNITY" | "BOOK" | "ABOUT";

const AuthorTab = [
  { title: "HOME", url: "" },
  { title: "COMMUNITY", url: "community" },
  { title: "BOOK", url: "book" },
  { title: "ABOUT", url: "about" },
] as const;

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

const getTabClassName = (tab: UserTab, selectedTab: UserTab) => {
  if (tab !== selectedTab) {
    return "text-white cursor-pointer text-sm select-none";
  } else {
    return "text-green-500 text-sm underline underline-offset-2 decoration-green-500 select-none";
  }
};

type props = {
  user: RouterOutputs["user"]["getData"] | undefined;
  penname: string;
};

enum UpdateType {
  is_edit = "is_edit",
  is_editToggle = "is_editToggle",
  update_penname = "update_penname",
  update_bio = "update_bio",
  error_occured = "error_occured",
}

type UpdateAction =
  | { type: UpdateType.is_edit; payload: boolean }
  | { type: UpdateType.is_editToggle; payload: null }
  | { type: UpdateType.error_occured; payload: boolean }
  | { type: UpdateType.update_penname; payload: string }
  | { type: UpdateType.update_bio; payload: string };

interface UpdateState {
  isEdit: boolean;
  updatedPenname: string;
  updatedBio: string;
  errorOccured: boolean;
}

const updateReducer = (state: UpdateState, action: UpdateAction) => {
  const { type, payload } = action;
  switch (type) {
    case UpdateType.update_penname:
      return { ...state, updatedPenname: payload };
    case UpdateType.update_bio:
      return { ...state, updatedBio: payload };
    case UpdateType.is_edit:
      return { ...state, isEdit: payload };
    case UpdateType.is_editToggle:
      return { ...state, isEdit: !state.isEdit };
    case UpdateType.error_occured:
      return { ...state, errorOccured: payload };
    default:
      return state;
  }
};

const UserBanner = ({ user, penname }: props) => {
  const router = useRouter();
  const context = api.useContext();
  const tab = useMemo(
    () => parseUserTab(router.pathname.split("/")[2]),
    [router.pathname]
  );
  const { status, data: session } = useSession();
  const isOwner = useMemo(() => {
    return session?.user.id === user?.id;
  }, [session?.user.id, user?.id]);
  const { data: isFollowed, isLoading: queryLoading } =
    api.user.isFollowUser.useQuery(user?.penname as string, {
      enabled: !isOwner && user?.penname != null,
    });

  const [updateState, dispatchUpdate] = useReducer(updateReducer, {
    isEdit: false,
    updatedPenname: penname,
    updatedBio: user?.bio || "",
    errorOccured: false,
  });

  const updateProfile = api.user.update.useMutation({
    onSuccess: () => {
      void context.user.getData.invalidate();
    },
  });
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
    dispatchUpdate({ type: UpdateType.is_editToggle, payload: null });
  }, []);
  const onSaveHandler = useCallback(() => {
    updateProfile.mutate(
      {
        penname: updateState.updatedPenname,
        bio: updateState.updatedBio,
      },
      {
        onSuccess(data) {
          if (data.penname) {
            void router.replace(`${data.penname}/${tab.url}`);
          }
          dispatchUpdate({ type: UpdateType.is_edit, payload: false });
        },
        onError() {
          dispatchUpdate({ type: UpdateType.error_occured, payload: true });
        },
      }
    );
  }, [
    router,
    tab,
    updateProfile,
    updateState.updatedBio,
    updateState.updatedPenname,
  ]);

  return (
    <>
      <ErrorDialog
        isOpen={updateState.errorOccured}
        isCloseHandler={() =>
          dispatchUpdate({ type: UpdateType.error_occured, payload: false })
        }
      />
      <div className="relative h-80 min-w-full">
        {user ? (
          <>
            <div className="absolute inset-0">
              <Image src="/mockWallpaper.jpeg" fill alt="wallpaper" />
            </div>
            <div className="ml-40 h-full max-w-xl bg-black/60 px-7 pt-7 backdrop-blur-lg">
              <div className="flex justify-between">
                <div className="relative mb-3 flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border">
                  <Image
                    src={user.image || "/placeholder_profile.png"}
                    alt="profile picture"
                    width="250"
                    height="250"
                    className="absolute z-0 opacity-70"
                  />
                </div>
                <div>
                  {isOwner && (
                    <div className="w-fit">
                      {updateState.isEdit ? (
                        <div className="flex gap-3">
                          <button
                            onClick={toggleIsEditHandler}
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
                {updateState.isEdit ? (
                  <input
                    placeholder={updateState.updatedPenname}
                    className="bg-transparent text-2xl font-bold text-white placeholder-gray-400 outline-none focus:outline-none"
                    onChange={(e) =>
                      dispatchUpdate({
                        type: UpdateType.update_penname,
                        payload: e.target.value,
                      })
                    }
                    value={updateState.updatedPenname}
                  />
                ) : (
                  <h2 className="text-2xl font-bold text-white">{penname}</h2>
                )}
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
              <div className="max-h-24 w-4/5 text-sm text-gray-100">
                {updateState.isEdit ? (
                  <textarea
                    rows={2}
                    placeholder={user.bio === "" ? "Put bio here" : user.bio}
                    value={updateState.updatedBio}
                    onChange={(e) =>
                      dispatchUpdate({
                        type: UpdateType.update_bio,
                        payload: e.target.value,
                      })
                    }
                    className="w-full resize-none bg-transparent placeholder-gray-400 outline-none"
                  />
                ) : (
                  <p>{user.bio}</p>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="ml-40 grid h-full max-w-xl items-center justify-center bg-black/60 px-7 pt-7 backdrop-blur-lg">
            <LoadingSpinner />
          </div>
        )}
      </div>
      <div className="sticky top-0 z-40 min-w-full">
        <div className="ml-40 flex max-w-xl items-center justify-between bg-black/60 px-7 py-3 shadow-lg backdrop-blur-lg">
          {AuthorTab.map((data) => (
            <button
              key={data.title}
              onClick={() => void router.push(`/${penname}/${data.url}`)}
              className={getTabClassName(data.title, tab.title)}
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
