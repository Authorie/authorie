import { api } from "~/utils/api";
import { useState, type FormEvent } from "react";
import { HiOutlinePhoto } from "react-icons/hi2";
import useImageUpload from "~/hooks/imageUpload";
import z from "zod";

type props = {
  chapterId: string;
};

const ChapterCommentInput = ({ chapterId }: props) => {
  const utils = api.useContext();
  const [content, setContent] = useState("");
  const { imageData, uploadHandler, resetImageData } = useImageUpload();
  const commentMutation = api.comment.create.useMutation();
  const uploadImage = api.upload.uploadImage.useMutation();

  const submitCommentHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let commentImageUrl;
    const urlParser = z.string().startsWith("data:image");
    if (imageData && urlParser.safeParse(imageData).success) {
      commentImageUrl = await uploadImage.mutateAsync({
        image: imageData,
      });
    }
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
      setContent("");
      resetImageData();
    }
  };

  return (
    <form
      onSubmit={(e) => void submitCommentHandler(e)}
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
