import Image from "next/image";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { HiXMark } from "react-icons/hi2";
import TextareaAutoSize from "react-textarea-autosize";
import { api } from "~/utils/api";
import { PhotoInputButton } from "../action/PhotoInputButton";

type props = {
  userImg: string;
  penname: string;
  communityPenname: string;
};

const CommunityInput = ({ userImg, penname, communityPenname }: props) => {
  const utils = api.useContext();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      content: "",
      discussionImageUrl: null as string | null,
    },
  });

  const postDiscussion = api.communityPosts.createNewPost.useMutation({
    onSuccess(_data, variables, _context) {
      reset();
      void utils.communityPosts.getAllPosts.invalidate({
        penname: variables.authorPenname,
      });
    },
  });

  const submitDiscussionHandler = handleSubmit(
    async (data) => {
      const { title, content, discussionImageUrl } = data;
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
    },
    (errors) => {
      if (errors.title) {
        toast.error(errors.title.message!);
      }
    }
  );

  return (
    <form
      className="flex h-fit w-full flex-col items-start justify-center gap-4 rounded-xl bg-white px-6 py-4"
      onSubmit={(e) => void submitDiscussionHandler(e)}
    >
      <div className="flex items-center gap-2">
        <div className="h-7 w-7 overflow-hidden rounded-full">
          <Image src={userImg} alt="user image" width={50} height={50} />
        </div>
        <span className="font-semibold">{penname}</span>
      </div>
      <div className="flex w-full flex-col bg-dark-100 px-4 pb-2 pt-4">
        <div className="flex h-fit w-full flex-col gap-4">
          <TextareaAutoSize
            minRows={1}
            placeholder="Write a title"
            className="text-dark-700 w-full resize-none bg-transparent text-xl font-semibold outline-none focus:outline-none"
            {...register("title", {
              required: "title is required",
              maxLength: 50,
            })}
          />
          {watch("discussionImageUrl") && (
            <div className="relative">
              <Image
                src={watch("discussionImageUrl") as string}
                alt="discussion's image"
                width={300}
                height={300}
              />
              <div
                onClick={() => setValue("discussionImageUrl", null)}
                className="absolute right-0 top-0 h-5 w-5 cursor-pointer rounded-full hover:text-red-400"
              >
                <HiXMark className="h-5 w-5" />
              </div>
            </div>
          )}
          <div>
            <TextareaAutoSize
              minRows={2}
              placeholder="Write a discussion"
              className="flex h-24 w-full resize-none bg-transparent text-gray-700 outline-none focus:outline-none"
              {...register("content")}
            />
          </div>
        </div>
        <PhotoInputButton
          color={"black"}
          hoverColor={"gray-300"}
          top={"bottom-0"}
          setImageUrl={(image: string) =>
            setValue("discussionImageUrl", image !== "" ? image : null)
          }
        />
      </div>
      <button
        type="submit"
        className="self-end rounded-lg bg-authGreen-500 px-5 py-2 text-sm font-semibold text-white hover:bg-authGreen-600"
      >
        Post
      </button>
    </form>
  );
};

export default CommunityInput;
