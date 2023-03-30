import useImageUpload from "@hooks/imageUpload";
import { api } from "@utils/api";
import Image from "next/image";
import { useState, type FormEvent } from "react";
import { HiOutlinePhoto } from "react-icons/hi2";

type props = {
  chapterId: string;
  parentId?: string;
};

const CommentInput = ({ chapterId, parentId }: props) => {
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
      className="mt-1 flex items-center gap-3 rounded-xl bg-white py-1 pl-3 pr-1"
    >
      <div className="h-8 w-8 overflow-hidden rounded-full">
        <Image
          src={user?.image || "/placeholder_profile.png"}
          alt="user's profile image"
          width={50}
          height={50}
        />
      </div>
      <div className="relaltive w-full">
        <input
          className="grow rounded-full bg-gray-200 px-4 py-1 text-sm outline-none focus:outline-none"
          placeholder="write comment here"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <label htmlFor="upload-image">
          <input
            id="upload-image"
            hidden
            type="file"
            accept="image/jepg, image/png"
            onChange={uploadHandler}
          />
          <HiOutlinePhoto className="absolute right-0 h-5 w-5 cursor-pointer" />
        </label>
      </div>
      <input type="submit" hidden />
    </form>
  );
};

export default CommentInput;
