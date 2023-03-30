import { api } from "@utils/api";
import Image from "next/image";

type props = {
  penname: string;
  image?: string;
  followersNumber: number;
  followingNumber: number;
  id: string;
  followUser: (userId: string) => void;
  unfollowUser: (userId: string) => void;
};

const UserCard = ({
  penname,
  image,
  followersNumber,
  followingNumber,
  id,
  followUser,
  unfollowUser,
}: props) => {
  const isFollowing = api.user.isFollowUser.useQuery(penname);
  return (
    <div className="w-96">
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
              <p className="w-20">{followersNumber} followers</p>
              <p className="w-20">{followingNumber} following</p>
            </div>
          </div>
        </div>
        {isFollowing ? (
          <button
            onClick={() => unfollowUser(id)}
            className="h-12 w-20 rounded-md bg-green-600 text-white hover:bg-green-700"
          >
            Followed
          </button>
        ) : (
          <button
            onClick={() => followUser(id)}
            className="h-12 w-20 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            Follow
          </button>
        )}
      </div>
    </div>
  );
};

export default UserCard;
