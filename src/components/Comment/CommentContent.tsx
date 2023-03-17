import Image from "next/image";
import ChatBubbleBottomCenterTextIcon from "@heroicons/react/24/outline/ChatBubbleBottomCenterTextIcon";
import EllipsisHorizontalIcon from "@heroicons/react/24/solid/EllipsisHorizontalIcon";
import HeartIconOutline from "@heroicons/react/24/outline/HeartIcon";
import HeartIconSolid from "@heroicons/react/24/solid/HeartIcon";
import { useState } from "react";
import type { ReactNode } from "react";

type props = {
  penname: string;
  image: string;
  commentImage: string;
  comment: string;
  like: number;
  commentNumber?: number;
  isReplyComment: boolean;
  children?: ReactNode;
  commentClick?: () => void;
};

const CommentContent = ({
  penname,
  image,
  commentImage,
  comment,
  like,
  commentNumber,
  isReplyComment,
  children,
  commentClick,
}: props) => {
  const [isLike, setIsLike] = useState(false);
  return (
    <div className="mt-3 rounded-xl bg-white py-1 pl-3 pr-1">
      <div className="flex gap-3 ">
        <div className="mt-4 h-8 w-8 overflow-hidden rounded-full">
          <Image
            src={image}
            alt={`${penname}'s profile image`}
            width={50}
            height={50}
          />
        </div>
        <div className="flex grow flex-col">
          <span className="font-semibold text-authGreen-600">{penname}</span>
          <div className="flex rounded-lg bg-gray-200 px-4 py-1">
            {commentImage && (
              <Image src={commentImage} alt={`${penname} commment's image`} />
            )}
            <div className="flex grow items-center justify-between">
              <p className="text-sm">{comment}</p>
              <EllipsisHorizontalIcon className="h-7 w-7" />
            </div>
          </div>
          <div className="mt-1 flex items-center gap-7">
            <div
              className="flex cursor-pointer items-center gap-1 transition duration-100 ease-in-out hover:-translate-y-[1px] hover:scale-105 hover:text-red-400"
              onClick={() => setIsLike(() => !isLike)}
            >
              {!isLike && <HeartIconOutline className="h-4 w-4" />}
              {isLike && <HeartIconSolid className="h-4 w-4 text-red-500" />}
              <span className={isLike ? "text-xs text-red-500" : "text-xs"}>
                {like}
              </span>
            </div>
            {!isReplyComment && (
              <div
                onClick={commentClick}
                className="flex cursor-pointer items-center gap-1 rounded-lg p-1 hover:bg-slate-100"
              >
                <ChatBubbleBottomCenterTextIcon className="h-4 w-4" />
                <span className="text-xs">{commentNumber}</span>
              </div>
            )}
            <p className="text-xs text-dark-400">date time</p>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
};

export default CommentContent;
