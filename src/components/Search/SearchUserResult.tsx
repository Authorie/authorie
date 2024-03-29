import Image from "next/image";
import Link from "next/link";
import type { RouterOutputs } from "~/utils/api";
import SearchResultCard from "./SearchResultCard";

type props = {
  onClick: () => void;
  user: RouterOutputs["search"]["searchUsers"]["items"][number];
};

const SearchUserResult = ({ user, onClick }: props) => {
  return (
    <SearchResultCard onClick={onClick}>
      <Link href={`/${user.penname!}`} className="flex grow">
        <div className="flex h-32 grow flex-col justify-between py-3">
          <div>
            <p className="text-xs text-authBlue-500">AUTHOR</p>
            <h4 className="w-72 text-xl font-bold text-authBlue-500">
              {user.penname}
            </h4>
            <p className="my-4 text-xs text-dark-600">{user.bio}</p>
          </div>
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
        </div>
        <div className="flex items-center justify-center">
          <div className="flex h-20 w-20 overflow-hidden rounded-full drop-shadow">
            <Image
              src={user.image || "/placeholder_profile.png"}
              fill
              className="object-cover"
              alt="user profile image"
            />
          </div>
        </div>
      </Link>
    </SearchResultCard>
  );
};

export default SearchUserResult;
