import Image from "next/image";
import { EditorContent } from "@tiptap/react";
import { LikeButton } from "@components/action";
import { CommentButton } from "@components/action";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { api } from "@utils/api";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import type { Content } from "@tiptap/react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import CommentInput from "@components/Comment/ReplyCommentInput";
import Comment from "@components/Comment/Comment";

type props = {
  chapterId: string;
};

const ChapterPost = ({ chapterId }: props) => {
  const [openComments, setOpenComments] = useState(false);
  const { status } = useSession();
  const utils = api.useContext();
  const { data: chapter } = api.chapter.getData.useQuery({ id: chapterId });
  const { data: isLike } = api.comment.isLike.useQuery({ id: chapterId });
  const {
    data: comments,
    isSuccess,
    isLoading,
  } = api.comment.getAll.useQuery(
    { chapterId: chapterId },
    { enabled: openComments }
  );
  const editor = useEditor({
    editable: false,
    content: chapter?.content as Content,
    extensions: [StarterKit],
  });
  const likeMutation = api.chapter.like.useMutation({
    onMutate: async () => {
      await utils.chapter.isLike.cancel();
      const previousLike = utils.chapter.isLike.getData();
      utils.chapter.isLike.setData({ id: chapterId }, (old) => !old);
      return { previousLike };
    },
    onSettled: () => {
      void utils.book.invalidate();
    },
  });
  const unlikeMutation = api.chapter.unlike.useMutation({
    onMutate: async () => {
      await utils.chapter.isLike.cancel();
      const previousLike = utils.chapter.isLike.getData();
      utils.chapter.isLike.setData({ id: chapterId }, (old) => !old);
      return { previousLike };
    },
    onSettled: () => {
      void utils.book.invalidate();
    },
  });

  const onLikeHandler = () => {
    if (likeMutation.isLoading && unlikeMutation.isLoading) return;
    if (isLike) {
      unlikeMutation.mutate({ id: chapterId });
    } else {
      likeMutation.mutate({ id: chapterId });
    }
  };

  return (
    <div className="max-w-5xl overflow-hidden rounded-xl bg-white shadow-md">
      <div className="relative flex flex-col gap-1 px-8 py-4">
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-white via-white to-transparent" />
        <div className="absolute inset-0">
          <Image src="/mockWallpaper.jpeg" alt="wallpaper" fill />
        </div>
        <div className="z-10">
          <h2 className="my-1 text-2xl font-bold">{chapter?.title}</h2>
          {chapter?.book && (
            <h3 className="text-dark-400">{chapter.book.title}</h3>
          )}
          <p className="text-sm text-dark-600">
            Author:
            <span className="font-semibold">{chapter?.owner.penname}</span>
          </p>
        </div>
      </div>
      <div className="my-3 px-8">
        {chapter?.publishedAt && (
          <p className="mb-2 text-xs text-dark-400">
            publish: {chapter?.publishedAt.toDateString()}
          </p>
        )}
        <EditorContent editor={editor} />
      </div>
      <div className="flex items-center justify-between px-8 py-2">
        <LikeButton
          isAuthenticated={status === "authenticated"}
          isLike={Boolean(isLike)}
          numberOfLike={chapter?._count.likes || 0}
          onClickHandler={onLikeHandler}
        />
        <CommentButton
          numberOfComments={chapter?._count.comments || 0}
          onClickHandler={() => setOpenComments((prev) => !prev)}
        />
        <div className="flex cursor-pointer items-center gap-2 rounded-full px-3 py-2 hover:bg-slate-100">
          <ArrowTopRightOnSquareIcon className="h-6 w-6" />
        </div>
      </div>
      {openComments && (
        <div className="bg-gray-300 px-4 pb-4 pt-2">
          {status === "authenticated" && <CommentInput chapterId={chapterId} />}
          {isSuccess &&
            comments.map((comment) => (
              <Comment key={comment.id} comment={comment} />
            ))}
          {isLoading && (
            <div className="bg-indigo-500">
              <svg
                className="... mr-3 h-5 w-5 animate-spin"
                viewBox="0 0 24 24"
              ></svg>
              Processing...
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChapterPost;
