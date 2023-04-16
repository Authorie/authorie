import Image from "next/image";
import { LikeButton } from "../action";
import CommunityCommentInput from "../Comment/CommunityCommentInput";

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
    <div className="bg-white">
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
        <div>{penname}</div>
      </div>
      <div className="flex flex-col gap-3 px-2 py-3">
        <p>{discussionTitle}</p>
        {discussionImage && (
          <Image src={discussionImage} alt="discussion image" />
        )}
        <p>{discussion}</p>
      </div>
      <div className="flex">
        <LikeButton
          isAuthenticated={isAuthenticated}
          isLiked={isLiked}
          numberOfLike={numberOfLike}
        />
        <CommunityCommentInput id={id} />
      </div>
    </div>
  );
};

export default CommunityPost;
