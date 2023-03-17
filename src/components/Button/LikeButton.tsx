import HeartIconOutline from "@heroicons/react/24/outline/HeartIcon";
import HeartIconSolid from "@heroicons/react/24/solid/HeartIcon";
import { useState } from "react";
import { useSession } from "next-auth/react";

type props = {
  numberOfLike: number;
  width: number;
  height: number;
  textSize: string;
};

const LikeButton = ({ numberOfLike, height, width, textSize }: props) => {
  const [isLike, setIsLike] = useState(false);
  const { data: session } = useSession();
  return (
    <div
      className={`flex cursor-pointer items-center gap-1 transition duration-100 ease-in-out hover:-translate-y-[1px] hover:scale-105 hover:text-red-400
        ${!session ? "pointer-events-none" : ""} `}
      onClick={() => setIsLike(() => !isLike)}
    >
      {!isLike && <HeartIconOutline className={`h-${height} w-${width}`} />}
      {isLike && (
        <HeartIconSolid className={`h-${height} w-${width} text-red-500`} />
      )}
      <span
        className={
          isLike ? `text-${textSize} text-red-500` : `text-${textSize}`
        }
      >
        {numberOfLike}
      </span>
    </div>
  );
};

export default LikeButton;
