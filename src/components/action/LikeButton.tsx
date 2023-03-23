import HeartIconOutline from "@heroicons/react/24/outline/HeartIcon";
import HeartIconSolid from "@heroicons/react/24/solid/HeartIcon";

type props = {
  isAuthenticated: boolean;
  isLike: boolean;
  numberOfLike: number;
  onClickHandler: () => void;
  small?: boolean;
};

export const LikeButton = ({
  isAuthenticated,
  isLike,
  numberOfLike,
  onClickHandler,
  small,
}: props) => {
  const textSize = small ? "xs" : "sm";
  const size = small ? "4" : "6";

  return (
    <div
      className={`flex cursor-pointer items-center transition duration-100 ease-in-out hover:-translate-y-[1px] hover:scale-105 hover:text-red-400
        ${!isAuthenticated ? "pointer-events-none" : ""} ${
        numberOfLike > 0 ? "gap-1" : ""
      }`}
      onClick={onClickHandler}
    >
      {isLike ? (
        <HeartIconSolid className={`h-${size} w-${size} text-red-500`} />
      ) : (
        <HeartIconOutline className={`h-${size} w-${size}`} />
      )}
      <span
        className={
          isLike ? `text-${textSize} text-red-500` : `text-${textSize}`
        }
      >
        {numberOfLike > 0 ? numberOfLike : ""}
      </span>
    </div>
  );
};
