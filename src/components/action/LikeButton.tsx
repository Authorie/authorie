import { HiHeart, HiOutlineHeart } from "react-icons/hi2";

type props = {
  isAuthenticated: boolean;
  isLiked: boolean;
  numberOfLike: number;
  onClickHandler?: () => void;
  small?: boolean;
};

const LikeButton = ({
  isAuthenticated,
  isLiked,
  numberOfLike,
  onClickHandler,
  small,
}: props) => {
  const textSize = small ? "xs" : "sm";
  const size = small ? "4" : "6";

  return (
    <div
      className={`flex cursor-pointer items-center transition duration-100 ease-in-out hover:-translate-y-[1px] hover:scale-105 hover:text-red-400
        ${!isAuthenticated ? "pointer-events-none" : ""} ${numberOfLike > 0 ? "gap-1" : ""
        }`}
      onClick={onClickHandler}
    >
      {isLiked ? (
        <HiHeart className={`h-${size} w-${size} text-red-500`} />
      ) : (
        <HiOutlineHeart className={`h-${size} w-${size}`} />
      )}
      <span
        className={
          isLiked ? `text-${textSize} text-red-500` : `text-${textSize}`
        }
      >
        {numberOfLike > 0 ? numberOfLike : ""}
      </span>
    </div>
  );
};

export default LikeButton;
