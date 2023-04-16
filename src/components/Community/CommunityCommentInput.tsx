import Image from "next/image";
import { useState } from "react";
import { PhotoInputButton } from "../action/PhotoInputButton";
import { api } from "~/utils/api";
import TextareaAutoSize from "react-textarea-autosize";
import { useSession } from "next-auth/react";
import type { ChangeEvent } from "react";
import { toast } from "react-hot-toast";

type props = {
  id: string;
};

const CommunityCommentInput = ({ id }: props) => {
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
    <form
      onSubmit={() => void submitCommentHandler()}
      className="flex w-full items-center gap-2"
    >
      <div className="h-6 w-6 overflow-hidden rounded-full bg-authGreen-500">
        {session && session.user.image && (
          <Image
            src={session?.user.image}
            alt="user's image"
            width={100}
            height={100}
          />
        )}
      </div>
      <div className="flex w-full items-center gap-2 rounded-lg bg-dark-100 px-3 py-1">
        <TextareaAutoSize
          minRows={1}
          onChange={commentChangeHandler}
          placeholder="Write a comment"
          className="w-full resize-none bg-transparent text-sm text-gray-600 outline-none focus:outline-none"
        />
        <div className="self-start">
          <PhotoInputButton
            setImageUrl={(image: string) => setCommentImageUrl(image)}
            color="black"
            hoverColor="gray-300"
          />
        </div>
      </div>
      <input type="submit" hidden />
    </form>
  );
};

export default CommunityCommentInput;
