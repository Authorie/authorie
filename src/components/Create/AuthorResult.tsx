import Image from "next/legacy/image";

type props = {
  penname: string;
};

const AuthorResult = ({ penname }: props) => {
  return (
    <div className="mb-2 flex w-72 items-center justify-between rounded-lg bg-white p-2 shadow-md">
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center overflow-hidden rounded-full">
          <Image
            src="/mockWallpaper.jpeg"
            alt="user profile"
            width={40}
            height={40}
          />
        </div>
        <h1 className="font-bold">{penname}</h1>
      </div>
      <button className="rounded-full bg-authGreen-500 px-3 py-1 text-xs font-semibold text-white hover:bg-authGreen-600">
        Add
      </button>
    </div>
  );
};

export default AuthorResult;
