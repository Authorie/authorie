import Image from "next/image";

type props = {
  username: string;
  userId: number;
  reads: number;
  followers: number;
  following: number;
};

const SearchUserResult = ({
  username,
  userId,
  reads,
  followers,
  following,
}: props) => {
  return (
    <>
      <div className="group/profile relative flex cursor-pointer justify-between rounded-lg bg-gradient-to-r from-dark-100 to-white p-7 shadow-lg">
        <div>
          <div className="mb-4 gap-2">
            <p className="text-xs">{`UserID: ${userId}`}</p>
            <h1 className="text-2xl font-semibold">{username}</h1>
          </div>
          <div className="my-5">
            <Image
              src="/favicon.ico"
              width={100}
              height={100}
              alt="dummy-pic"
            />
          </div>
          <div className="flex gap-[60px]">
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
        </div>
        <button className="invisible flex items-center text-dark-400 group-hover/profile:visible">
          <p>view profile</p>
        </button>
      </div>
      <button className="absolute right-[54%] top-[39%] rounded-lg bg-green-500 px-6 py-2 text-sm text-white hover:bg-green-600">
        Follow
      </button>
    </>
  );
};

export default SearchUserResult;
