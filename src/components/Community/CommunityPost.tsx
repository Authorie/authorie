import Image from "next/image";
import { LikeButton } from "../action";
import CommunityCommentInput from "./CommunityCommentInput";
import { HiChatBubbleBottomCenterText } from "react-icons/hi2";

type props = {
  penname: string;
  userImg: string | null;
  discussion: string | null;
  discussionTitle: string | null;
  discussionImage: string | null;
  isAuthenticated: boolean;
  isLiked: boolean;
  numberOfLike: number;
  numberOfComment: number;
  id: string;
};

const CommunityPost = ({
  penname,
  userImg,
  discussion,
  discussionTitle,
  discussionImage,
  isAuthenticated,
  isLiked,
  numberOfLike,
  numberOfComment,
  id,
}: props) => {
  return (
    <div className="flex max-w-2xl flex-col rounded-xl bg-white px-6 py-4">
      <div className="flex gap-2">
        <div className="h-7 w-7 overflow-hidden rounded-full bg-authGreen-500">
          {userImg && (
            <Image
              src={userImg}
              alt="user profile image"
              width={50}
              height={50}
            />
          )}
        </div>
        <div className="font-semibold">{penname}</div>
      </div>
      <div className="flex flex-col gap-4 py-4">
        <p className="text-2xl font-bold">{discussionTitle}</p>
        {discussionImage && (
          <div className="flex items-center justify-center">
            <Image
              src={discussionImage}
              alt="discussion image"
              width={300}
              height={300}
            />
          </div>
        )}
        <p className="line-clamp-4 w-full">{discussion}</p>
      </div>
      <div className="mb-4 flex items-center gap-8">
        <LikeButton
          isAuthenticated={isAuthenticated}
          isLiked={isLiked}
          numberOfLike={numberOfLike}
        />
        <div className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-sm text-authGreen-600 hover:bg-authGreen-100">
          <HiChatBubbleBottomCenterText className="h-6 w-6" />
          {numberOfComment}
        </div>
      </div>
      <CommunityCommentInput id={id} />
    </div>
  );
};

export default CommunityPost;
