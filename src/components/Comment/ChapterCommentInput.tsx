import { useState, type FormEvent } from "react";
import { api } from "~/utils/api";
import { PhotoInputButton } from "../action/PhotoInputButton";

type props = {
  chapterId: string;
};

const ChapterCommentInput = ({ chapterId }: props) => {
  const utils = api.useContext();
  const [content, setContent] = useState("");
  const commentMutation = api.comment.create.useMutation();
  const [commentImageUrl, setCommentImageUrl] = useState<string>("");
  const submitCommentHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (content !== "") {
      commentMutation.mutate(
        {
          id: chapterId,
          parent: undefined,
          content,
          image: commentImageUrl !== "" ? commentImageUrl : undefined,
        },
        {
          onSuccess() {
            void utils.comment.getAll.invalidate({ chapterId });
          },
        }
      );
      setCommentImageUrl("");
      setContent("");
    }
  };

  return (
    <form
      onSubmit={(e) => void submitCommentHandler(e)}
      className="relative flex w-full items-center gap-3 rounded-xl py-1 pl-3 pr-1"
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
      <div className="flex w-full items-center gap-1">
        <input
          className="w-full rounded-full bg-gray-200 px-4 py-1 text-sm outline-none focus:outline-none"
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

export default ChapterCommentInput;
