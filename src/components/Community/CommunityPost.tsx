import Image from "next/image";
import { LikeButton } from "../action";
import CommunityCommentInput from "./CommunityCommentInput";
import { HiChatBubbleBottomCenterText } from "react-icons/hi2";
import { api } from "~/utils/api";
import { useState } from "react";
import CommentContainer from "./CommentContainer";
import { DateLabel } from "../action/DateLabel";

type props = {
  isAuthenticated: boolean;
  id: string;
};

const CommunityPost = ({ isAuthenticated, id }: props) => {
  const utils = api.useContext();
  const { data: post } = api.communityPosts.getPost.useQuery({ id });
  const [openComment, setOpenComment] = useState(false);
  const toggleLike = api.communityPosts.toggleLikePost.useMutation({
    onSuccess() {
      void utils.communityPosts.getPost.invalidate({ id });
    },
  });

  const onLikeHandler = () => {
    toggleLike.mutate({
      postId: id,
      like: !post?.isLike,
    });
  };

  return (
    <div className="flex w-[672px] flex-col rounded-xl bg-white px-6">
      <div className="flex w-full flex-col py-4">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 overflow-hidden rounded-full bg-authGreen-500">
            {post?.user.image && (
              <Image
                src={post.user.image}
                alt="user profile image"
                width={50}
                height={50}
              />
            )}
          </div>
          <div className="font-semibold">{post?.user.penname}</div>
          <DateLabel date={post?.createdAt as Date} withTime={false} hover />
        </div>
        <div className="flex flex-col gap-4 py-4">
          <p className="text-2xl font-bold">{post?.title}</p>
          {post?.image && (
            <div className="flex items-center justify-center">
              <Image
                src={post.image}
                alt="discussion image"
                width={300}
                height={300}
              />
            </div>
          )}
          <p className="line-clamp-4 w-full">{post?.content}</p>
        </div>
        <div className="mb-4 flex items-center gap-8">
          <LikeButton
            isAuthenticated={isAuthenticated}
            isLiked={post?.isLike || false}
            numberOfLike={post?._count?.likes || 0}
            onClickHandler={onLikeHandler}
          />
          <div
            className={`flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-sm text-authGreen-600 hover:bg-authGreen-100 ${
              post?.children.length === 0 ? "pointer-events-none" : ""
            }`}
            onClick={() => setOpenComment((prev) => !prev)}
          >
            <HiChatBubbleBottomCenterText className="h-6 w-6" />
            {post?.children?.length}
          </div>
        </div>
        <CommunityCommentInput id={id} />
      </div>
      {openComment && (
        <CommentContainer
          isAuthenticated={isAuthenticated}
          commentsId={post?.children}
          noMoreReply={false}
        />
      )}
    </div>
  );
};

export default CommunityPost;
