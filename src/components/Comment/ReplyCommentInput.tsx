import Image from "next/image";
import { api } from "@utils/api";
import { useState, type FormEvent } from "react";
import useImageUpload from "@hooks/imageUpload";
import { PhotoIcon } from "@heroicons/react/24/outline";

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
      className="mt-1 flex items-center gap-3 rounded-xl bg-white py-1 pl-3 pr-1"
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
          className="w-full rounded-full bg-gray-200 px-4 py-1 text-xs outline-none focus:outline-none"
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
          <PhotoIcon className="h-5 w-5" />
        </label>
      </div>
      <input type="submit" hidden />
    </form>
  );
};

export default ReplyCommentInput;
