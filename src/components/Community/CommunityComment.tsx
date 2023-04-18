import { api } from "~/utils/api";
import Image from "next/image";
import { DateLabel } from "../action/DateLabel";
import { LikeButton } from "../action";
import { HiChatBubbleBottomCenterText } from "react-icons/hi2";
import { useState } from "react";
import CommentContainer from "./CommentContainer";
import CommunityCommentInput from "./CommunityCommentInput";

type props = {
  id: string;
  isAuthenticated: boolean;
  noMoreReply: boolean;
};

const CommunityComment = ({ id, isAuthenticated, noMoreReply }: props) => {
  const { data: comment } = api.communityPosts.getPost.useQuery({ id });
  const [openComment, setOpenComment] = useState(false);
  const utils = api.useContext();
  const toggleLike = api.communityPosts.toggleLikePost.useMutation({
    onSuccess() {
      void utils.communityPosts.getPost.invalidate({ id });
    },
  });

  const onLikeHandler = () => {
    toggleLike.mutate({
      postId: id,
      like: !comment?.isLike,
    });
  };

  return (
    <div className="flex flex-col border-t pt-2">
      <div className="flex items-center gap-2">
        <div className="h-7 w-7 overflow-hidden rounded-full bg-authGreen-500">
          {comment?.user.image && (
            <Image
              src={comment?.user.image}
              alt="user's profile image"
              width={50}
              height={50}
            />
          )}
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold">{comment?.user.penname}</p>
          <p className="mb-2 text-gray-500">.</p>
          <DateLabel
            date={comment?.createdAt as Date}
            withTime={false}
            size={"xs"}
            hover
          />
        </div>
      </div>
      <div className="ml-9 flex flex-col">
        <div className="mb-2 flex flex-col gap-3">
          {comment?.image && (
            <Image
              src={comment?.image}
              width={100}
              height={100}
              alt="comment image"
            />
          )}
          <p className="text-sm">{comment?.content}</p>
        </div>
        <div className="mb-2 flex items-center">
          <div className="w-10">
            <LikeButton
              isAuthenticated={isAuthenticated}
              isLiked={comment?.isLike || false}
              numberOfLike={comment?._count.likes || 0}
              onClickHandler={() => void onLikeHandler()}
              small
            />
          </div>
          {!noMoreReply && (
            <div className="flex w-14 items-start">
              <div
                className={`flex cursor-pointer items-center gap-1 rounded-lg p-1 text-xs text-authGreen-600 hover:bg-authGreen-100`}
                onClick={() => setOpenComment((prev) => !prev)}
              >
                <HiChatBubbleBottomCenterText className="h-4 w-4" />
                {comment?.children?.length}
              </div>
            </div>
          )}
        </div>
        {!noMoreReply && openComment && (
          <div>
            <div className="mb-2">
              <CommunityCommentInput id={id} />
            </div>
            <CommentContainer
              isAuthenticated={isAuthenticated}
              commentsId={comment?.children}
              noMoreReply={true}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityComment;
