import CommunityComment from "./CommunityComment";

type props = {
  commentsId: { id: string }[] | undefined;
  isAuthenticated: boolean;
  noMoreReply: boolean;
};

const CommentContainer = ({
  commentsId,
  isAuthenticated,
  noMoreReply,
}: props) => {
  return (
    <div className="flex flex-col">
      {commentsId &&
        commentsId.map((comment) => (
          <CommunityComment
            key={comment.id}
            id={comment.id}
            isAuthenticated={isAuthenticated}
            noMoreReply={noMoreReply}
          />
        ))}
    </div>
  );
};

export default CommentContainer;
