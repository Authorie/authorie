import Image from "next/image";
import { UserIcon } from "@heroicons/react/24/solid";

type props = {
  penname: string;
  userId: number;
  reads: number;
  followers: number;
  following: number;
  bio: string;
};

const SearchUserResult = ({
  penname,
  userId,
  reads,
  followers,
  following,
  bio,
}: props) => {

  const onClickCard = () => {
    //redirect to that user profile
    console.log("redirect!")
  }

  return (
    <div onClick={onClickCard} className="cursor-pointer transition ease-in-out flex shadow-lg rounded gap-4 hover:-translate-y-1 hover:scale-[1.01] duration-300">
      <div className="w-2/12 rounded-l flex justify-center items-center bg-blue-300">
        <UserIcon className="w-12 h-12 fill-white" />
      </div>
      <div className="py-3 w-8/12">
        <p className="font-semibold text-dark-400 text-xs">{`User Id: ${userId}`}</p>
        <h1 className="font-bold text-2xl text-black">{penname}</h1>
        <div className="flex gap-[60px] text-sm">
          <p>
            <span className="font-semibold">{followers}</span> followers
          </p>
          <p>
            <span className="font-semibold">{following}</span> following
          </p>
          <p>
            <span className="font-semibold">{reads}</span> reads
          </p>
        </div>
        <p className="text-xs text-dark-600 my-4">{bio}</p>
      </div>
      <div className="flex items-center justify-center w-4/12">
        <div className="rounded-full overflow-hidden">
        <Image src="/favicon.ico" width={100} height={100} alt="dummy-pic" />
        </div>
      </div>
    </div>
  )
};

export default SearchUserResult;
