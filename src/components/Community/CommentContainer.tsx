import CommunityComment from "./CommunityComment";

type props = {
  commentsId: { id: string }[] | undefined;
};

const CommentContainer = ({ commentsId }: props) => {
  return (
    <div className="flex flex-col gap-2 p-2">
      {commentsId &&
        commentsId.map((comment) => (
          <CommunityComment key={comment.id} id={comment.id} />
        ))}
    </div>
  );
};

export default CommentContainer;
