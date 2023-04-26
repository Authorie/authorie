import Image from "next/image";
import { useState, type FormEvent } from "react";
import { api } from "~/utils/api";
import { PhotoInputButton } from "../action/PhotoInputButton";

type props = {
  chapterId: string;
  parentId: string;
};

const ReplyCommentInput = ({ chapterId, parentId }: props) => {
  const utils = api.useContext();
  const [content, setContent] = useState("");
  const { data: user } = api.user.getData.useQuery();
  const commentMutation = api.comment.create.useMutation();
  const [commentImageUrl, setCommentImageUrl] = useState("");

  const submitCommentHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (content !== "") {
      commentMutation.mutate(
        {
          id: chapterId,
          parent: parentId,
          content,
          image: commentImageUrl !== "" ? commentImageUrl : undefined,
        },
        {
          onSuccess(_data, variables, _context) {
            setContent("");
            setCommentImageUrl("");
            void utils.comment.getData.invalidate({ id: variables.parent });
          },
        }
      );
    }
  };

  return (
    <form
      onSubmit={(e) => void submitCommentHandler(e)}
      className="relative ml-1 flex items-center gap-1 rounded-xl bg-white pb-2"
    >
      {commentImageUrl && (
        <div
          onClick={() => setCommentImageUrl("")}
          className="group/image-add absolute -top-2 right-0 cursor-pointer rounded-full bg-green-400 px-1 text-xs font-semibold text-white hover:bg-red-400"
        >
          <p className="visible group-hover/image-add:hidden">image added</p>
          <p className="hidden group-hover/image-add:block">remove image</p>
        </div>
      )}
      <div className="h-8 w-9 overflow-hidden rounded-full">
        <Image
          src={user?.image || "/placeholder_profile.png"}
          alt="user's profile image"
          width={50}
          height={50}
        />
      </div>
      <div className="flex w-full items-center gap-2">
        <input
          className="w-full rounded-md bg-gray-200 px-4 py-1 text-sm outline-none focus:outline-none"
          placeholder="write comment here"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <PhotoInputButton
          setImageUrl={(image: string) => setCommentImageUrl(image)}
        />
      </div>
      <input type="submit" hidden />
    </form>
  );
};

export default ReplyCommentInput;
