import Image from "next/image";
import { HiUser } from "react-icons/hi2";
import type { RouterOutputs } from "~/utils/api";
import SearchResultCard from "./SearchResultCard";

type props = {
  user: RouterOutputs["search"]["searchUsers"]["items"][number];
  onClickCard: () => void;
};

const SearchUserResult = ({ user, onClickCard }: props) => {
  return (
    <SearchResultCard onClick={onClickCard}>
      <div className="flex w-2/12 items-center justify-center rounded-l bg-authBlue-500">
        <HiUser className="h-12 w-12 fill-white" />
      </div>
      <div className="grow py-3">
        <p className="text-xs font-semibold text-authBlue-500">AUTHOR</p>
        <h4 className="text-2xl font-bold text-authBlue-500">{user.penname}</h4>
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
        <div className="overflow-hidden rounded-full drop-shadow">
          <Image
            src={user.image || "/placeholder_profile.png"}
            width={100}
            height={100}
            alt="user profile image"
          />
        </div>
      </div>
    </SearchResultCard>
  );
};

export default SearchUserResult;
