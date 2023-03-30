import { CommentButton, LikeButton } from "@components/action";
import type { RouterOutputs } from "@utils/api";
import { api } from "@utils/api";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
import { HiEllipsisHorizontal } from "react-icons/hi2";
import CommentInput from "./CommentInput";

type props = {
  comment:
    | RouterOutputs["comment"]["getAll"][number]
    | RouterOutputs["comment"]["getAll"][number]["replies"][number];
};

const Comment = ({ comment }: props) => {
  const { status } = useSession();
  const utils = api.useContext();
  const [openReplies, setOpenReplies] = useState(false);
  const { data: isLike } = api.comment.isLike.useQuery({ id: comment.id });
  const likeMutation = api.chapter.like.useMutation({
    onMutate: async () => {
      await utils.comment.isLike.cancel();
      const previousLike = utils.comment.isLike.getData();
      utils.comment.isLike.setData({ id: comment.id }, (old) => !old);
      return { previousLike };
    },
    onSettled: () => {
      void utils.book.invalidate();
    },
  });
  const unlikeMutation = api.chapter.unlike.useMutation({
    onMutate: async () => {
      await utils.comment.isLike.cancel();
      const previousLike = utils.comment.isLike.getData();
      utils.comment.isLike.setData({ id: comment.id }, (old) => !old);
      return { previousLike };
    },
    onSettled: () => {
      void utils.book.invalidate();
    },
  });

  const onLikeHandler = () => {
    if (likeMutation.isLoading && unlikeMutation.isLoading) return;
    if (isLike) {
      unlikeMutation.mutate({ id: comment.id });
    } else {
      likeMutation.mutate({ id: comment.id });
    }
  };

  return (
    <div className="mt-3 rounded-xl bg-white py-1 pl-3 pr-1">
      <div className="flex gap-3 ">
        <div className="mt-4 h-8 w-8 overflow-hidden rounded-full">
          <Image
            src={comment.user.image || "/placeholder_profile.png"}
            alt={`${comment.user.penname || "user"} profile image`}
            width={50}
            height={50}
          />
        </div>
        <div className="flex grow flex-col">
          <span className="font-semibold text-authGreen-600">
            {comment.user.penname || ""}
          </span>
          <div className="flex rounded-lg bg-gray-200 px-4 py-1">
            {comment.image !== null && (
              <Image
                src={comment.image}
                alt={`${comment.user.penname || "user"} commment's image`}
              />
            )}
            <div className="flex grow items-center justify-between">
              <p className="text-sm">{comment.content}</p>
              <HiEllipsisHorizontal className="h-7 w-7" />
            </div>
          </div>
          <div className="mt-1 flex items-center gap-7">
            <LikeButton
              isAuthenticated={status === "authenticated"}
              isLike={Boolean(isLike)}
              numberOfLike={comment._count.likes}
              onClickHandler={onLikeHandler}
              small
            />
            {comment.parentCommentId === null && (
              <CommentButton
                numberOfComments={comment._count.replies}
                onClickHandler={() => setOpenReplies((prev) => !prev)}
                small
              />
            )}
            <p className="text-xs text-dark-400">date time</p>
          </div>
        </div>
      </div>
      {openReplies &&
        "replies" in comment &&
        comment.replies.map((reply) => (
          <div key={comment.id} className="ml-10">
            <Comment comment={reply} />
          </div>
        ))}
      {openReplies && (
        <div className="ml-10">
          <CommentInput chapterId={comment.chapterId} />
        </div>
      )}
    </div>
  );
};

export default Comment;
