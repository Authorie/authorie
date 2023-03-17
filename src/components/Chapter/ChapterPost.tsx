import ArrowTopRightOnSquareIcon from "@heroicons/react/24/outline/ArrowTopRightOnSquareIcon";
import { useState } from "react";
import LikeButton from "@components/Button/LikeButton";
import CommentInput from "@components/Comment/CommentInput";
import CommentBoard from "@components/Comment/CommentBoard";
import { comment } from "mocks/comment";
import Image from "next/image";
import CommentButton from "@components/Button/CommentButton";

type props = {
  bookTitle: string;
  author: string[];
  chapterNumber: number;
  chapterTitle: string;
  publishDate: Date;
  content: string;
  like: number;
  numberOfComment: number;
};

const ChapterPost = ({
  bookTitle,
  chapterTitle,
  publishDate,
  content,
  like,
  author,
  numberOfComment,
}: props) => {
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
        <LikeButton numberOfLike={like} width={6} height={6} textSize="sm" />
        <CommentButton
          onClick={() => setCommentClicked(() => !commentClicked)}
          width={6}
          height={6}
          textSize="sm"
          numberOfComment={numberOfComment}
        />
        <div className="flex cursor-pointer items-center gap-2 rounded-full px-3 py-2 hover:bg-slate-100">
          <ArrowTopRightOnSquareIcon className="h-6 w-6" />
        </div>
      </div>
      {commentClicked && (
        <div className="bg-gray-300 px-4 pb-4 pt-2">
          <CommentInput />
          {comment &&
            comment.map((comment) => (
              <CommentBoard
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
