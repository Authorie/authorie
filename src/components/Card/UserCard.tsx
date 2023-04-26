import Image from "next/image";
import { useRouter } from "next/router";
import type { MouseEvent } from "react";
import { type RouterOutputs } from "~/utils/api";

type props = {
  user: RouterOutputs["user"]["getData"];
  followUser: (userId: string) => void;
  unfollowUser: (userId: string) => void;
};

const UserCard = ({ user, followUser, unfollowUser }: props) => {
  const router = useRouter();
  const followHandler = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    followUser(user.id);
  };
  const unfollowHandler = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    unfollowUser(user.id);
  };

  const onClickHandler = () => {
    void router.push(`/${user.penname!}`, undefined, { shallow: true });
  };
  return (
    <div
      onClick={onClickHandler}
      className="max-h-[500px] w-full cursor-pointer rounded-full px-4 py-1 hover:bg-gray-200"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 overflow-hidden rounded-full">
            <Image
              src={user.image ?? "/placeholder_profile.png"}
              width={40}
              height={40}
              alt={`${user.penname!}'s profile picture`}
            />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-lg font-semibold">{user.penname!}</p>
            <div className="flex">
              <p className="w-52">
                <span className="font-semibold">{user.followers.length}</span>{" "}
                followers
              </p>
              <p className="w-52">
                <span className="font-semibold">{user.following.length}</span>{" "}
                following
              </p>
            </div>
          </div>
        </div>
        {!user.isOwner &&
          (user.isFollowing ? (
            <button
              type="button"
              onClick={unfollowHandler}
              className="h-8 w-20 rounded-md bg-green-600 text-sm font-semibold text-white outline-none hover:bg-green-700"
            >
              Followed
            </button>
          ) : (
            <button
              type="button"
              onClick={followHandler}
              className="h-8 w-20 rounded-md bg-blue-600 text-sm text-white outline-none hover:bg-blue-700"
            >
              Follow
            </button>
          ))}
      </div>
    </div>
  );
};

export default UserCard;
