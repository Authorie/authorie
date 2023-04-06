import { CommentButton, LikeButton } from "~/components/action";
import type { RouterOutputs } from "~/utils/api";
import { api } from "~/utils/api";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { HiEllipsisHorizontal } from "react-icons/hi2";
import ReplyCommentInput from "./ReplyCommentInput";

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
  const [isLiked, setIsLiked] = useState(isLike);
  const likeMutation = api.comment.like.useMutation({
    onMutate: async () => {
      await utils.comment.isLike.cancel();
      const previousLike = utils.comment.isLike.getData();
      utils.comment.isLike.setData({ id: comment.id }, (old) => !old);
      return { previousLike };
    },
    onSettled: () => {
      void utils.comment.invalidate();
      void utils.book.invalidate();
    },
  });
  const unlikeMutation = api.comment.unlike.useMutation({
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
    if (isLiked) {
      unlikeMutation.mutate({ id: comment.id });
      setIsLiked(false);
      return;
    } else {
      likeMutation.mutate({ id: comment.id });
      setIsLiked(true);
      return;
    }
  };

  useEffect(() => {
    setIsLiked(isLike);
  }, [isLike]);

  return (
    <div className="my-2 rounded-xl bg-white px-1 pt-1">
      <div className="flex gap-1 ">
        <div className="mt-6 h-6 w-6 overflow-hidden rounded-full">
          <Image
            src={comment.user.image || "/placeholder_profile.png"}
            alt={`${comment.user.penname || "user"} profile image`}
            width={50}
            height={50}
          />
        </div>
        <div className="flex grow flex-col">
          <span className="text-sm font-semibold text-authGreen-600">
            {comment.user.penname || ""}
          </span>
          <div className="flex rounded-lg bg-gray-200 px-2">
            {comment.image !== null && (
              <Image
                src={comment.image}
                alt={`${comment.user.penname || "user"} commment's image`}
              />
            )}
            <div className="flex h-8 grow items-center justify-between">
              <p className="text-sm">{comment.content}</p>
              <HiEllipsisHorizontal className="h-7 w-7" />
            </div>
          </div>
          <div className="my-1 flex items-center justify-between pr-2">
            <div className="flex gap-7">
              <LikeButton
                isAuthenticated={status === "authenticated"}
                isLiked={Boolean(isLiked)}
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
            </div>
            <p className="text-xs text-dark-400">
              {comment.createdAt.toDateString().split(" ").slice(1).join(" ")}
            </p>
          </div>
        </div>
      </div>
      {openReplies &&
        "replies" in comment &&
        comment.replies.map((reply) => (
          <div key={comment.id} className="-mb-1 -mt-2 ml-7">
            <Comment comment={reply} />
          </div>
        ))}
      {openReplies && (
        <div className="ml-7">
          <ReplyCommentInput
            chapterId={comment.chapterId}
            parentId={comment.id || undefined}
          />
        </div>
      )}
    </div>
  );
};

export default Comment;
