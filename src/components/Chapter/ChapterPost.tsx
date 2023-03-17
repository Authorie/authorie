import HeartIconOutline from "@heroicons/react/24/outline/HeartIcon";
import HeartIconSolid from "@heroicons/react/24/solid/HeartIcon";
import ChatBubbleBottomCenterTextIcon from "@heroicons/react/24/outline/ChatBubbleBottomCenterTextIcon";
import ArrowTopRightOnSquareIcon from "@heroicons/react/24/outline/ArrowTopRightOnSquareIcon";
import { useState } from "react";
import CommentInput from "@components/Comment/CommentInput";
import Comment from "@components/Comment/Comment";
import { comment } from "mocks/comment";
import Image from "next/image";

type props = {
  bookTitle: string;
  author: string[];
  chapterNumber: number;
  chapterTitle: string;
  publishDate: Date;
  content: string;
  like: number;
  share: number;
};

const ChapterPost = ({
  bookTitle,
  chapterTitle,
  publishDate,
  content,
  like,
  share,
  author,
}: props) => {
  const [isLike, setIsLike] = useState(false);
  const [commentClicked, setCommentClicked] = useState(false);
  return (
    <div className="max-w-5xl overflow-hidden rounded-xl bg-white shadow-md">
      <div className="relative flex flex-col gap-1 px-8 py-4">
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-white via-white to-transparent" />
        <div className="absolute inset-0">
          <Image src="/mockWallpaper.jpeg" alt="wallpaper" fill />
        </div>
        <div className="z-10">
          <h1 className="my-1 text-2xl font-bold">{chapterTitle}</h1>
          <h1 className="text-dark-400">{bookTitle}</h1>
          <p className="text-sm text-dark-600">
            Author:{" "}
            {author.map((penname) => (
              <span key={penname} className="font-semibold">
                {penname}
              </span>
            ))}
          </p>
        </div>
      </div>
      <div className="my-3 px-8">
        <p className="mb-2 text-xs text-dark-400">
          publish: {publishDate.toDateString()}
        </p>
        {content}
      </div>
      <div className="flex items-center justify-between px-8 py-2">
        <div
          className="flex cursor-pointer items-center gap-1 transition duration-100 ease-in-out hover:-translate-y-[1px] hover:scale-105 hover:text-red-400"
          onClick={() => setIsLike(() => !isLike)}
        >
          {!isLike && <HeartIconOutline className="h-6 w-6" />}
          {isLike && <HeartIconSolid className="h-6 w-6 text-red-500" />}
          <span className={isLike ? "text-sm text-red-500" : "text-sm"}>
            {like}
          </span>
        </div>
        <div
          onClick={() => setCommentClicked(() => !commentClicked)}
          className="flex cursor-pointer items-center gap-2 rounded-full px-3 py-2 hover:bg-slate-100"
        >
          <ChatBubbleBottomCenterTextIcon className="h-6 w-6" />
          <span className="text-sm">Comments</span>
        </div>
        <div className="flex cursor-pointer items-center gap-2 rounded-full px-3 py-2 hover:bg-slate-100">
          <span className="text-sm">{share}</span>
          <ArrowTopRightOnSquareIcon className="h-6 w-6" />
        </div>
      </div>
      {commentClicked && (
        <div className="bg-gray-300 px-4 pb-4 pt-2">
          <CommentInput />
          {comment &&
            comment.map((comment) => (
              <Comment
                key={comment.id}
                penname={comment.penname}
                comment={comment.comment}
                image={comment.image}
                commentImage={comment.commentImage}
                like={comment.like}
                commentNumber={comment.commentNumber}
                replyData={comment.replyData}
              />
            ))}
        </div>
      )}
    </div>
  );
};

export default ChapterPost;
