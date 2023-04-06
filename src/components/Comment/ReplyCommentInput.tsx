import useImageUpload from "@hooks/imageUpload";
import { api } from "@utils/api";
import Image from "next/image";
import { useState, type FormEvent } from "react";
import { HiOutlinePhoto } from "react-icons/hi2";

type props = {
  chapterId: string;
  parentId?: string;
};

const ReplyCommentInput = ({ chapterId, parentId }: props) => {
  const utils = api.useContext();
  const [content, setContent] = useState("");
  const { imageData, uploadHandler } = useImageUpload();
  const { data: user } = api.user.getData.useQuery();
  const commentMutation = api.comment.create.useMutation();

  const submitCommentHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (content !== "") {
      commentMutation.mutate(
        {
          id: chapterId,
          parent: parentId,
          content,
          image: imageData !== "" ? imageData : undefined,
        },
        {
          onSuccess() {
            setContent("");
            void utils.comment.getAll.invalidate({ chapterId });
          },
        }
      );
    }
  };

  return (
    <form
      onSubmit={submitCommentHandler}
      className="ml-1 flex items-center gap-1 rounded-xl bg-white pb-2"
    >
      <div className="h-6 w-7 overflow-hidden rounded-full">
        <Image
          src={user?.image || "/placeholder_profile.png"}
          alt="user's profile image"
          width={50}
          height={50}
        />
      </div>
      <div className="flex w-full gap-2">
        <input
          className="w-full rounded-md bg-gray-200 px-4 py-1 text-xs outline-none focus:outline-none"
          placeholder="write comment here"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <label
          htmlFor="upload-image"
          className="flex w-10 cursor-pointer items-center justify-center rounded-lg hover:bg-gray-200"
        >
          <input
            id="upload-image"
            hidden
            type="file"
            accept="image/jepg, image/png"
            onChange={uploadHandler}
          />
          <HiOutlinePhoto className="absolute h-5 w-5 cursor-pointer" />
        </label>
      </div>
      <input type="submit" hidden />
    </form>
  );
};

export default ReplyCommentInput;
