import { type RouterOutputs } from "~/utils/api";
import CommunityComment from "./CommunityComment";
import { useAutoAnimate } from "@formkit/auto-animate/react";

type props = {
  comments: (RouterOutputs["communityPosts"]["getPost"] | undefined)[];
  isAuthenticated: boolean;
  noMoreReply: boolean;
};

const CommentContainer = ({
  comments,
  isAuthenticated,
  noMoreReply,
}: props) => {
  const [animationParent] = useAutoAnimate();
  return (
    <div className="flex flex-col" ref={animationParent}>
      {comments.map((comment) =>
        comment ? (
          <CommunityComment
            key={comment.id}
            comment={comment}
            noMoreReply={noMoreReply}
            isAuthenticated={isAuthenticated}
          />
        ) : null
      )}
    </div>
  );
};

export default CommentContainer;
