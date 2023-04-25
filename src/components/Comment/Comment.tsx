import { useSession } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
import { CommentButton, LikeButton } from "~/components/action";
import type { RouterOutputs } from "~/utils/api";
import { api } from "~/utils/api";
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
  const { data: isLike } = api.comment.isLike.useQuery(
    { id: comment.id },
    { enabled: status === "authenticated" }
  );
  const likeMutation = api.comment.like.useMutation({
    onMutate: async () => {
      await utils.comment.getAll.cancel({ chapterId: comment.chapterId });
      await utils.comment.isLike.cancel({ id: comment.id });
      const previousLike = utils.comment.isLike.getData({ id: comment.id });
      const previousComments = utils.comment.getAll.getData({
        chapterId: comment.chapterId,
      });
      utils.comment.isLike.setData({ id: comment.id }, true);
      utils.comment.getAll.setData({ chapterId: comment.chapterId }, (old) => {
        if (!old) return old;
        const index = old.findIndex((c) => c.id === comment.id);
        if (index === -1) return old;
        const newComments = old.slice();
        newComments[index]!._count.likes += 1;
        return newComments;
      });
      return { previousLike, previousComments };
    },
    onError: (err, variables, context) => {
      if (!context) return;
      utils.comment.isLike.setData({ id: comment.id }, context.previousLike);
      utils.comment.getAll.setData(
        { chapterId: comment.chapterId },
        context.previousComments
      );
    },
    onSettled: () => {
      void utils.comment.invalidate();
      void utils.book.invalidate();
    },
  });
  const unlikeMutation = api.comment.unlike.useMutation({
    onMutate: async () => {
      await utils.comment.getAll.cancel({ chapterId: comment.chapterId });
      await utils.comment.isLike.cancel({ id: comment.id });
      const previousLike = utils.comment.isLike.getData({ id: comment.id });
      const previousComments = utils.comment.getAll.getData({
        chapterId: comment.chapterId,
      });
      utils.comment.isLike.setData({ id: comment.id }, false);
      utils.comment.getAll.setData({ chapterId: comment.chapterId }, (old) => {
        if (!old) return old;
        const index = old.findIndex((c) => c.id === comment.id);
        if (index === -1) return old;
        const newComments = old.slice();
        newComments[index]!._count.likes -= 1;
        return newComments;
      });
      return { previousLike, previousComments };
    },
    onError: (err, variables, context) => {
      if (!context) return;
      utils.comment.isLike.setData({ id: comment.id }, context.previousLike);
      utils.comment.getAll.setData(
        { chapterId: comment.chapterId },
        context.previousComments
      );
    },
    onSettled: () => {
      void utils.comment.getAll.invalidate({ chapterId: comment.chapterId });
      void utils.comment.isLike.invalidate({ id: comment.id });
    },
  });

  const onLikeHandler = () => {
    if (typeof isLike !== "boolean") return;
    if (likeMutation.isLoading && unlikeMutation.isLoading) return;
    if (isLike) {
      unlikeMutation.mutate({ id: comment.id });
      return;
    } else {
      likeMutation.mutate({ id: comment.id });
      return;
    }
  };

  return (
    <div className="w-[800px] border-y bg-white px-1 pt-2">
      <div className="flex gap-1 px-1">
        <div className="h-14 w-14 overflow-hidden rounded-full">
          <Image
            src={comment.user.image || "/placeholder_profile.png"}
            alt={`${comment.user.penname || "user"} profile image`}
            width={170}
            height={170}
          />
        </div>
        <div className="flex flex-col gap-1 rounded-lg px-2">
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-authGreen-600">
              {comment.user.penname || ""}
            </span>
            <p className="text-xs text-dark-400">
              {comment.createdAt.toDateString().split(" ").slice(1).join(" ")}
            </p>
          </div>
          <div className="flex grow items-center justify-between">
            <p className="text-sm">{comment.content}</p>
          </div>
          {comment.image !== null && (
            <Image
              src={comment.image}
              alt={`${comment.user.penname || "user"} commment's image`}
              width={580}
              height={580}
            />
          )}
          <div className="flex gap-7 pb-1">
            <LikeButton
              isAuthenticated={status === "authenticated"}
              isLiked={Boolean(isLike)}
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
        </div>
      </div>
      {openReplies &&
        "replies" in comment &&
        comment.replies.map((reply) => (
          <div key={reply.id} className="pl-16">
            <Comment comment={reply} />
          </div>
        ))}
      {openReplies && (
        <div className="ml-7 mt-2">
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
