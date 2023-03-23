import HeartIconOutline from "@heroicons/react/24/outline/HeartIcon";
import HeartIconSolid from "@heroicons/react/24/solid/HeartIcon";

type props = {
  isAuthenticated: boolean;
  isLike: boolean;
  numberOfLike: number;
  onClickHandler: () => void;
};

export const ChapterLikeButton = ({
  isAuthenticated,
  isLike,
  numberOfLike,
  onClickHandler,
}: props) => {
  return (
    <div
      className={`flex cursor-pointer items-center rounded-full border border-white p-1 text-white transition duration-100 ease-in-out hover:-translate-y-[1px] hover:scale-105 hover:border-red-600 hover:text-red-600
      ${!isAuthenticated ? "pointer-events-none" : ""} ${
        numberOfLike > 0 ? "gap-1" : ""
      }`}
      onClick={onClickHandler}
    >
      {isLike ? (
        <HeartIconSolid className={`h-6 w-6 text-red-600`} />
      ) : (
        <HeartIconOutline className={`h-6 w-6`} />
      )}
      <span className={isLike ? `text-sm text-red-500` : `text-sm`}>
        {numberOfLike > 0 ? numberOfLike : ""}
      </span>
    </div>
  );
};
