import useImageUpload from "@hooks/imageUpload";
import { api } from "@utils/api";
import { useState, type FormEvent } from "react";
import { HiOutlinePhoto } from "react-icons/hi2";

type props = {
  chapterId: string;
};

const ChapterCommentInput = ({ chapterId }: props) => {
  const utils = api.useContext();
  const [content, setContent] = useState("");
  const { imageData, uploadHandler } = useImageUpload();
  const commentMutation = api.comment.create.useMutation();

  const submitCommentHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (content !== "") {
      commentMutation.mutate(
        {
          id: chapterId,
          parent: undefined,
          content,
          image: imageData !== "" ? imageData : undefined,
        },
        {
          onSuccess() {
            void utils.comment.getAll.invalidate({ chapterId });
          },
        }
      );
      setContent("");
    }
  };

  return (
    <form
      onSubmit={submitCommentHandler}
      className="flex w-full items-center gap-3 rounded-xl py-1 pl-3 pr-1"
    >
      <div className="flex w-full gap-1">
        <input
          className="w-full rounded-full bg-gray-200 px-4 py-1 text-sm outline-none focus:outline-none"
          placeholder="write comment here"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <label
          htmlFor="upload-image"
          className="flex w-8 cursor-pointer items-center justify-center rounded-lg hover:bg-gray-500"
        >
          <input
            id="upload-image"
            hidden
            type="file"
            accept="image/jepg, image/png"
            onChange={uploadHandler}
          />
          <HiOutlinePhoto className="h-5 w-5 text-white" />
        </label>
      </div>
      <input type="submit" hidden />
    </form>
  );
};

export default ChapterCommentInput;
