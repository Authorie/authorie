import Image from "next/image";
import { PhotoInputButton } from "../action/PhotoInputButton";
import { useState } from "react";
import { api } from "~/utils/api";
import type { ChangeEvent } from "react";
import { toast } from "react-hot-toast";
import TextareaAutoSize from "react-textarea-autosize";
import { HiXMark } from "react-icons/hi2";

type props = {
  userImg: string;
  penname: string;
};

const CommunityInput = ({ userImg, penname }: props) => {
  const utils = api.useContext();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [discussionImageUrl, setDiscussionImageUrl] = useState("");
  const postDiscussion = api.communityPosts.createNewPost.useMutation({
    onSuccess() {
      void utils.communityPosts.getAllPosts.invalidate();
    },
  });

  const titleChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const contentChangeHandler = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const submitDiscussionHandler = async () => {
    if (!content && !discussionImageUrl) return;
    const promisePostDiscussion = postDiscussion.mutateAsync({
      title: title,
      content: content,
      authorPenname: penname,
      image: discussionImageUrl,
      parentId: undefined,
    });
    await toast.promise(promisePostDiscussion, {
      loading: `Posting discussion`,
      success: `Posted successfully!`,
      error: "Post Failed!",
    });
  };

  return (
    <div className="flex h-fit flex-col items-start justify-center gap-4 rounded-xl bg-white p-4 px-6">
      <div className="flex gap-2">
        <div className="h-7 w-7 overflow-hidden rounded-full">
          <Image src={userImg} alt="user image" width={50} height={50} />
        </div>
        <div className="font-semibold">{penname}</div>
      </div>
      <div className="flex flex-col bg-dark-100 px-4 pb-2 pt-4">
        <div className="flex h-fit flex-col gap-4">
          <input
            onChange={titleChangeHandler}
            placeholder="Write a title"
            className="text-dark-700 bg-transparent text-xl font-semibold outline-none focus:outline-none"
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
            onChange={contentChangeHandler}
            placeholder="Write a discussion"
            minRows={2}
            className="h-24 w-[524px] bg-transparent text-gray-700 outline-none focus:outline-none"
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
