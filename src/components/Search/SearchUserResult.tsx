import Image from "next/image";
import { UserIcon } from "@heroicons/react/24/solid";

type props = {
  penname: string;
  reads: number;
  followers: number;
  following: number;
  bio: string;
};

const SearchUserResult = ({
  penname,
  reads,
  followers,
  following,
  bio,
}: props) => {
  const onClickCard = () => {
    //redirect to that user profile
    console.log("redirect!");
  };

  return (
    <div
      onClick={onClickCard}
      className="mb-3 flex h-44 cursor-pointer gap-4 rounded shadow-lg transition duration-300 ease-in-out hover:-translate-y-1 hover:scale-[1.01]"
    >
      <div className="flex w-2/12 items-center justify-center rounded-l bg-authBlue-500">
        <UserIcon className="h-12 w-12 fill-white" />
      </div>
      <div className="w-8/12 py-3">
        <p className="text-xs font-semibold text-authBlue-500">AUTHOR</p>
        <h1 className="text-2xl font-bold text-authBlue-500">{penname}</h1>
        <div className="flex gap-16 text-sm">
          <p>
            <span className="font-semibold text-authBlue-500">{followers}</span>{" "}
            followers
          </p>
          <p>
            <span className="font-semibold text-authBlue-500">{following}</span>{" "}
            following
          </p>
          <p>
            <span className="font-semibold text-authBlue-500">{reads}</span>{" "}
            reads
          </p>
        </div>
        <p className="my-4 text-xs text-dark-600">{bio}</p>
      </div>
      <div className="flex w-2/12 items-center">
        <div className="overflow-hidden rounded-full">
          <Image src="/favicon.ico" width={100} height={100} alt="dummy-pic" />
        </div>
      </div>
    </div>
  );
};

export default SearchUserResult;
