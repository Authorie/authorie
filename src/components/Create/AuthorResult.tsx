import Image from "next/legacy/image";
import { useAddAuthor } from "@hooks/addAuthor";

type props = {
  penname: string;
};

const AuthorResult = ({ penname }: props) => {
  const addAuthor = useAddAuthor();

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
      <button
        onClick={() => {
          addAuthor(penname);
        }}
        className="rounded-full bg-authGreen-500 px-3 py-1 text-xs font-semibold text-white hover:bg-authGreen-600"
      >
        Add
      </button>
    </div>
  );
};

export default AuthorResult;
