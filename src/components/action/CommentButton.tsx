import { HiOutlineChatBubbleBottomCenterText } from "react-icons/hi2";

type props = {
  numberOfComments: number;
  onClickHandler?: () => void;
  small?: boolean;
};

export const CommentButton = ({
  numberOfComments,
  onClickHandler,
  small,
}: props) => {
  const textSize = small ? "xs" : "sm";
  const size = small ? "4" : "6";

  return (
    <div
      onClick={onClickHandler}
      className="flex cursor-pointer items-center gap-2 rounded-full px-3 py-1 hover:bg-slate-100"
    >
      <HiOutlineChatBubbleBottomCenterText className={`h-${size} w-${size}`} />
      <span className={`text-${textSize}`}>
        {numberOfComments > 0 ? numberOfComments : ""} {small && "comments"}
      </span>
    </div>
  );
};
