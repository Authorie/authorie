import Image from "next/image";
import EllipsisHorizontalIcon from "@heroicons/react/24/solid/EllipsisHorizontalIcon";
import type { ReactNode } from "react";
import LikeButton from "@components/Button/LikeButton";
import CommentButton from "@components/Button/CommentButton";

type props = {
  penname: string;
  image: string;
  commentImage: string;
  comment: string;
  like: number;
  commentNumber?: number;
  isReplyComment: boolean;
  children?: ReactNode;
  commentClick: () => void;
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
            <LikeButton
              width={4}
              height={4}
              textSize="xs"
              numberOfLike={like}
            />
            {!isReplyComment && (
              <CommentButton
                onClick={() => commentClick()}
                width={4}
                height={4}
                textSize="xs"
                numberOfComment={commentNumber ?? 0}
                small
              />
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
