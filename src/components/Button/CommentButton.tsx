import ChatBubbleBottomCenterTextIcon from "@heroicons/react/24/outline/ChatBubbleBottomCenterTextIcon";

type props = {
  onClick: () => void;
  numberOfComment: number;
  height: number;
  width: number;
  textSize: string;
  small?: boolean;
};

const CommentButton = ({
  onClick,
  numberOfComment,
  height,
  width,
  textSize,
  small,
}: props) => {
  return (
    <div
      onClick={onClick}
      className="flex cursor-pointer items-center gap-2 rounded-full px-3 py-2 hover:bg-slate-100"
    >
      <ChatBubbleBottomCenterTextIcon className={`h-${height} w-${width}`} />
      <span className={`text-${textSize}`}>
        {numberOfComment} {!small && "Comments"}
      </span>
    </div>
  );
};

export default CommentButton;
