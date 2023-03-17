import CommentContent from "./CommentContent";
import CommentInput from "./CommentInput";
import { useState } from "react";

type ReplyComment = {
  id: string;
  penname: string;
  image: string;
  commentImage: string;
  comment: string;
  like: number;
};

type props = {
  penname: string;
  image: string;
  commentImage: string;
  comment: string;
  like: number;
  commentNumber: number;
  replyData: ReplyComment[];
};

const CommentBoard = ({
  penname,
  image,
  commentImage,
  comment,
  like,
  commentNumber,
  replyData,
}: props) => {
  const [commentClicked, setCommentClicked] = useState(false);
  return (
    <>
      <CommentContent
        penname={penname}
        image={image}
        commentImage={commentImage}
        comment={comment}
        like={like}
        commentNumber={commentNumber}
        isReplyComment={false}
        commentClick={() => setCommentClicked(() => !commentClicked)}
      >
        {commentClicked &&
          replyData &&
          replyData.map((comment) => (
            <div key={comment.id} className="ml-10">
              <CommentContent
                penname={comment.penname}
                image={comment.image}
                commentImage={comment.commentImage}
                comment={comment.comment}
                like={comment.like}
                isReplyComment={true}
                commentClick={() => setCommentClicked(() => !commentClicked)}
              />
            </div>
          ))}
        {commentClicked && <CommentInput />}
      </CommentContent>
    </>
  );
};

export default CommentBoard;
