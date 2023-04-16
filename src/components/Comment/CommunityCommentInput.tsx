import Image from "next/image";
import { useState } from "react";
import { PhotoInputButton } from "../action/PhotoInputButton";
import { api } from "~/utils/api";
import TextareaAutoSize from "react-textarea-autosize";
import { useSession } from "next-auth/react";
import type { ChangeEvent } from "react";
import { toast } from "react-hot-toast";

type props = {
  userImg?: string;
  id: string;
};

const CommunityCommentInput = ({ userImg, id }: props) => {
  const { data: session } = useSession();
  const utils = api.useContext();
  const [comment, setComment] = useState("");
  const [commentImageUrl, setCommentImageUrl] = useState<string>("");
  const postComment = api.communityPosts.createNewPost.useMutation({
    onSuccess() {
      void utils.communityPosts.getAllPosts.invalidate();
    },
  });

  const commentChangeHandler = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
  };

  const submitCommentHandler = async () => {
    const promisePostComment = postComment.mutateAsync({
      title: "",
      content: comment,
      authorPenname: session?.user.penname as string,
      image: commentImageUrl,
      parentId: id,
    });
    await toast.promise(promisePostComment, {
      loading: `Commenting...`,
      success: `Commented!`,
      error: "Error occured while comment!",
    });
  };
  //add comment in community post api
  return (
    <form onSubmit={() => void submitCommentHandler()} className="flex p-2">
      <div className="h-6 w-6 overflow-hidden rounded-full bg-authGreen-500">
        {userImg && (
          <Image src={userImg} alt="user's image" width={100} height={100} />
        )}
      </div>
      <div className="p-1">
        {commentImageUrl && (
          <Image
            src={commentImageUrl}
            alt="comment image"
            width={150}
            height={150}
          />
        )}
        <TextareaAutoSize
          minRows={1}
          onChange={commentChangeHandler}
          placeholder="Write a comment"
          className="text-gray-600"
        />
        <PhotoInputButton
          setImageUrl={(image: string) => setCommentImageUrl(image)}
        />
      </div>
      <input type="submit" hidden />
    </form>
  );
};

export default CommunityCommentInput;
