import { UserIcon } from "@heroicons/react/24/solid";
import type { RouterOutputs } from "@utils/api";
import Image from "next/image";

type props = {
  user: RouterOutputs["search"]["searchUsers"]["items"][number];
};

const SearchUserResult = ({ user }: props) => {
  const onClickCard = () => {
    console.log("redirect!");
  };

  return (
    <div
      onClick={onClickCard}
      className="flex cursor-pointer gap-4 rounded shadow-md drop-shadow-xl transition duration-300 ease-in-out hover:-translate-y-1 hover:scale-[1.01]"
    >
      <div className="flex w-2/12 items-center justify-center rounded-l bg-authBlue-500">
        <UserIcon className="h-12 w-12 fill-white" />
      </div>
      <div className="grow py-3">
        <p className="text-xs font-semibold text-authBlue-500">AUTHOR</p>
        <h1 className="text-2xl font-bold text-authBlue-500">{user.penname}</h1>
        <div className="flex gap-16 text-sm">
          <p>
            <span className="font-semibold text-authBlue-500">
              {user._count.followers}
            </span>{" "}
            followers
          </p>
          <p>
            <span className="font-semibold text-authBlue-500">
              {user._count.following}
            </span>{" "}
            following
          </p>
        </div>
        <p className="my-4 text-xs text-dark-600">{user.bio}</p>
      </div>
      <div className="flex w-2/12 items-center">
        <div className="drop-shadow-l overflow-hidden rounded-full">
          <Image
            src={user.image || "/placeholder_profile.png"}
            width={100}
            height={100}
            alt="user profile image"
          />
        </div>
      </div>
    </div>
  );
};

export default SearchUserResult;
