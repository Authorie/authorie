import HeartIconOutline from "@heroicons/react/24/outline/HeartIcon";
import HeartIconSolid from "@heroicons/react/24/solid/HeartIcon";

type props = {
  isAuthenticated: boolean;
  isLiked: boolean;
  numberOfLike: number;
  onClickHandler: () => void;
};

export const ChapterLikeButton = ({
  isAuthenticated,
  isLiked,
  numberOfLike,
  onClickHandler,
}: props) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-white">
      {numberOfLike > 0 ? numberOfLike : ""}
      </span>
      <div
        className={`${
          isLiked ? "border-red-600" : ""
        } flex cursor-pointer items-center rounded-full border border-white p-1 text-white transition duration-100 ease-in-out hover:-translate-y-[1px] hover:scale-105 hover:border-red-600 hover:text-red-600
      ${!isAuthenticated ? "pointer-events-none" : ""} ${
          numberOfLike > 0 ? "gap-1" : ""
        }`}
        onClick={onClickHandler}
      >
        {isLiked ? (
          <HeartIconSolid className={`h-6 w-6 text-red-600`} />
        ) : (
          <HeartIconOutline className={`h-6 w-6`} />
        )}
      </div>
    </div>
  );
};
