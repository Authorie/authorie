import { useSession } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
import { CommentButton, LikeButton } from "~/components/action";
import type { RouterOutputs } from "~/utils/api";
import { api } from "~/utils/api";
import ReplyCommentInput from "./ReplyCommentInput";

type props = {
  comment:
  | RouterOutputs["comment"]["getData"]
  | RouterOutputs["comment"]["getData"]["replies"][number];
};

const Comment = ({ comment }: props) => {
  const { status, data: session } = useSession();
  const utils = api.useContext();
  const isLike = comment.likes.some(({ userId }) =>
    session ? session.user.id === userId : false
  );
  const [openReplies, setOpenReplies] = useState(false);
  const likeMutation = api.comment.like.useMutation({
    async onMutate(variables) {
      await utils.comment.getData.cancel(variables);
      const previousData = utils.comment.getData.getData(variables);
      utils.comment.getData.setData(variables, (old) => {
        if (!old) return old;
        return {
          ...old,
          likes: [...old.likes, { userId: session!.user.id }],
          _count: { ...old._count, likes: old._count.likes + 1 },
        };
      });
      return { previousData };
    },
    onSettled(_data, error, variables, context) {
      if (error) {
        utils.comment.getData.setData(variables, context?.previousData);
      }
      void utils.comment.getData.invalidate(variables);
    },
  });
  const unlikeMutation = api.comment.unlike.useMutation({
    async onMutate(variables) {
      await utils.comment.getData.cancel(variables);
      const previousData = utils.comment.getData.getData(variables);
      utils.comment.getData.setData(variables, (old) => {
        if (!old) return old;
        return {
          ...old,
          likes: old.likes.filter(({ userId }) => userId !== session!.user.id),
          _count: { ...old._count, likes: old._count.likes - 1 },
        };
      });
      return { previousData };
    },
    onSettled(_data, error, variables, context) {
      if (error) {
        utils.comment.getData.setData(variables, context?.previousData);
      }
      void utils.comment.getData.invalidate(variables);
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
            parentId={comment.id}
          />
        </div>
      )}
    </div>
  );
};

export default Comment;
