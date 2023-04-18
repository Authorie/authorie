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
  const [commentImageUrl, setCommentImageUrl] = useState<string>();
  const postComment = api.communityPosts.createNewPost.useMutation({
    onSuccess() {
      void utils.communityPosts.getPost.invalidate({ id });
    },
  });

  const commentChangeHandler = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
  };

  const handleKeyDown = async (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      const promisePostComment = postComment.mutateAsync({
        title: "",
        content: comment,
        authorPenname: session?.user.penname as string,
        image: commentImageUrl || undefined,
        parentId: id,
      });
      await toast.promise(promisePostComment, {
        loading: `Commenting...`,
        success: `Commented!`,
        error: "Error occured while comment!",
      });
      setComment("");
      setCommentImageUrl(undefined);
    }
  };

  return (
    <div className="relative flex w-full items-center gap-2">
      {commentImageUrl && (
        <div
          onClick={() => setCommentImageUrl("")}
          className="group/image-add absolute -top-2 right-0 cursor-pointer rounded-full bg-green-400 px-1 text-xs font-semibold text-white hover:bg-red-400"
        >
          <p className="visible group-hover/image-add:hidden">image added</p>
          <p className="hidden group-hover/image-add:block">remove image</p>
        </div>
      )}
      <div className="h-7 w-8 overflow-hidden rounded-full bg-authGreen-500">
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
          onKeyDown={(e) => void handleKeyDown(e)}
          value={comment}
        />
        <div className="self-start">
          <PhotoInputButton
            setImageUrl={(image: string) => setCommentImageUrl(image)}
            color="black"
            hoverColor="gray-300"
            top="bottom-0"
          />
        </div>
      </div>
      <input type="submit" hidden />
    </div>
  );
};

export default CommunityCommentInput;
