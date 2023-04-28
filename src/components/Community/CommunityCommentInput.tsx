import { useSession } from "next-auth/react";
import Image from "next/image";
import { toast } from "react-hot-toast";
import TextareaAutoSize from "react-textarea-autosize";
import { api } from "~/utils/api";
import { useForm } from "react-hook-form";
import { PhotoInputButton } from "../action/PhotoInputButton";
import { FiArrowUpCircle } from "react-icons/fi";

type props = {
  id: string;
  openCommentHandler: () => void;
};

const CommunityCommentInput = ({ id, openCommentHandler }: props) => {
  const utils = api.useContext();
  const { data: session } = useSession();
  const { register, handleSubmit, watch, setValue, reset } = useForm({
    defaultValues: {
      comment: "",
      commentImageUrl: null as string | null,
    },
  });

  const postComment = api.communityPosts.createNewPost.useMutation({
    onSuccess() {
      void utils.communityPosts.getPost.invalidate({ id });
      reset();
      openCommentHandler();
    },
  });

  const submitCommentHandler = async (data: {
    comment: string;
    commentImageUrl: string | null;
  }) => {
    const { comment, commentImageUrl } = data;
    if (!session) {
      toast.error("You must be logged in to comment!");
      return;
    }
    if (!comment) {
      toast.error("Comment cannot be empty!");
      return;
    }
    const promisePostComment = postComment.mutateAsync({
      title: "",
      content: comment,
      authorPenname: session.user.penname!,
      image: commentImageUrl || undefined,
      parentId: id,
    });
    await toast.promise(promisePostComment, {
      loading: `Commenting...`,
      success: `Commented!`,
      error: "Error occured while comment!",
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSubmit(submitCommentHandler)();
    }
  };

  return (
    <form
      className="relative flex w-full items-center gap-2"
      onSubmit={(e) => void handleSubmit(submitCommentHandler)(e)}
    >
      {watch("commentImageUrl") && (
        <div
          onClick={() => setValue("commentImageUrl", null)}
          className="group/image-add absolute -top-2 right-0 cursor-pointer rounded-full bg-green-400 px-1 text-xs font-semibold text-white hover:bg-red-400"
        >
          <p className="visible group-hover/image-add:hidden">image added</p>
          <p className="hidden group-hover/image-add:block">remove image</p>
        </div>
      )}
      <div className="w-8">
        <div className="h-7 w-7 overflow-hidden rounded-full bg-authGreen-500">
          {session && (
            <Image
              src={session.user.image ?? "/placeholder_profile.png"}
              alt="user's image"
              width={100}
              height={100}
            />
          )}
        </div>
      </div>
      <div className="flex grow items-center gap-2 rounded-lg bg-dark-100 px-3 py-1">
        <TextareaAutoSize
          minRows={1}
          placeholder="Write a comment"
          className="grow resize-none bg-transparent text-sm text-gray-600 outline-none focus:outline-none"
          onKeyDown={handleKeyDown}
          {...register("comment")}
        />
        <PhotoInputButton
          setImageUrl={(image: string) =>
            setValue("commentImageUrl", image !== "" ? image : null)
          }
          color="black"
          hoverColor="gray-300"
          top="bottom-0"
        />

        <button
          type="submit"
          disabled={watch("comment", "").length === 0}
          className="group"
        >
          <FiArrowUpCircle
            className={`stroke-2 text-authGreen-600 group-disabled:text-gray-900`}
          />
        </button>
      </div>
    </form>
  );
};

export default CommunityCommentInput;
