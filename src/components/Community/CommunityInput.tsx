import Image from "next/image";
import { PhotoInputButton } from "../action/PhotoInputButton";
import { useState } from "react";
import { api } from "~/utils/api";
import { toast } from "react-hot-toast";
import TextareaAutoSize from "react-textarea-autosize";
import { HiXMark } from "react-icons/hi2";

type props = {
  userImg: string;
  penname: string;
  communityPenname: string;
};

const CommunityInput = ({ userImg, penname, communityPenname }: props) => {
  const utils = api.useContext();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [discussionImageUrl, setDiscussionImageUrl] = useState<string | null>(
    null
  );

  const postDiscussion = api.communityPosts.createNewPost.useMutation({
    onSuccess(_data, variables, _context) {
      setTitle("");
      setContent("");
      setDiscussionImageUrl(null);
      void utils.communityPosts.getAllPosts.invalidate({
        penname: variables.authorPenname,
      });
    },
  });

  const submitDiscussionHandler = async () => {
    if (!content) return;
    const promisePostDiscussion = postDiscussion.mutateAsync({
      title: title,
      content: content,
      authorPenname: communityPenname,
      image: discussionImageUrl || undefined,
      parentId: undefined,
    });
    await toast.promise(promisePostDiscussion, {
      loading: `Posting discussion`,
      success: `Posted successfully!`,
      error: "Post Failed!",
    });
  };

  return (
    <div className="flex h-fit w-[672px] flex-col items-start justify-center gap-4 rounded-xl bg-white px-6 py-4">
      <div className="flex items-center gap-2">
        <div className="h-7 w-7 overflow-hidden rounded-full">
          <Image src={userImg} alt="user image" width={50} height={50} />
        </div>
        <div className="font-semibold">{penname}</div>
      </div>
      <div className="flex w-full flex-col bg-dark-100 px-4 pb-2 pt-4">
        <div className="flex h-fit w-full flex-col gap-4">
          <TextareaAutoSize
            minRows={1}
            onChange={({ target }) => setTitle(target.value)}
            value={title}
            placeholder="Write a title"
            className="text-dark-700 w-full resize-none bg-transparent text-xl font-semibold outline-none focus:outline-none"
          />
          {discussionImageUrl && (
            <div className="relative">
              <Image
                src={discussionImageUrl}
                alt="discussion's image"
                width={300}
                height={300}
              />
              <div
                onClick={() => setDiscussionImageUrl("")}
                className="absolute right-0 top-0 h-5 w-5 cursor-pointer rounded-full hover:text-red-400"
              >
                <HiXMark className="h-5 w-5" />
              </div>
            </div>
          )}
          <TextareaAutoSize
            value={content}
            onChange={({ target }) => setContent(target.value)}
            placeholder="Write a discussion"
            minRows={2}
            className="flex h-24 w-full resize-none bg-transparent text-gray-700 outline-none focus:outline-none"
          />
        </div>
        <PhotoInputButton
          color={"black"}
          hoverColor={"gray-300"}
          top={"bottom-0"}
          setImageUrl={(image: string) => setDiscussionImageUrl(image)}
        />
      </div>
      <button
        onClick={() => void submitDiscussionHandler()}
        className="self-end rounded-lg bg-authGreen-500 px-5 py-2 text-sm font-semibold text-white hover:bg-authGreen-600"
      >
        Post
      </button>
    </div>
  );
};

export default CommunityInput;
