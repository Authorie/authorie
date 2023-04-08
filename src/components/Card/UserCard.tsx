import { api } from "~/utils/api";
import Image from "next/image";
import { useRouter } from "next/router";
import type { MouseEvent } from "react";

type props = {
  penname: string;
  image?: string;
  followersNumber: number;
  followingNumber: number;
  userId: string;
  followUser: (userId: string) => void;
  unfollowUser: (userId: string) => void;
};

const UserCard = ({
  penname,
  image,
  followersNumber,
  followingNumber,
  userId,
  followUser,
  unfollowUser,
}: props) => {
  const { data: isFollowed } = api.user.isFollowUser.useQuery(penname, {
    enabled: penname !== null,
  });
  const router = useRouter();
  const followHandler = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    followUser(userId);
  };
  const unfollowHandler = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    unfollowUser(userId);
  };
  return (
    <div
      onClick={() => void router.push(`/${penname}`)}
      className="max-h-[500px] w-full cursor-pointer rounded-full px-4 py-1 hover:bg-gray-200"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {image ? (
            <div className="h-8 w-8 overflow-hidden rounded-full">
              <Image
                src={image}
                width={40}
                height={40}
                alt={`${penname}'s profile picture`}
              />
            </div>
          ) : (
            <div className="bg-authGreen-600" />
          )}
          <div className="flex flex-col gap-1">
            <p className="text-lg font-semibold">{penname}</p>
            <div className="flex">
              <p className="w-52">
                <span className="font-semibold">{followersNumber}</span>{" "}
                followers
              </p>
              <p className="w-52">
                <span className="font-semibold">{followingNumber}</span>{" "}
                following
              </p>
            </div>
          </div>
        </div>
        {isFollowed ? (
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
        )}
      </div>
    </div>
  );
};

export default UserCard;
