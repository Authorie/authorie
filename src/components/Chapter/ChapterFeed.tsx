import { CommentButton, LikeButton } from "@components/action";
import type { Content } from "@tiptap/react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { api, type RouterOutputs } from "@utils/api";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";

type props = {
  chapter: RouterOutputs["chapter"]["getAll"]["items"][number];
};

const ChapterFeed = ({ chapter }: props) => {
  const router = useRouter();
  const { status } = useSession();
  const editor = useEditor({
    editable: false,
    content: chapter.content as Content,
    extensions: [StarterKit],
  });
  const { data: isLike } = api.comment.isLike.useQuery({ id: chapter.id });

  return (
    <div
      onClick={() => void router.push(`/chapter/${chapter.id}`)}
      className="max-w-5xl cursor-pointer overflow-hidden rounded-xl bg-white shadow-md transition duration-100 ease-in-out hover:bg-gray-100"
    >
      <div className="relative flex flex-col gap-1 px-8 py-4">
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-white via-white/60 to-transparent" />
        <div className="absolute inset-0">
          <Image src="/mockWallpaper.jpeg" alt="wallpaper" fill />
        </div>
        <div className="z-10">
          <h2 className="my-1 text-2xl font-bold">{chapter.title}</h2>
          {chapter.book && (
            <h3 className="text-dark-400">{chapter.book.title}</h3>
          )}
          <p className="text-sm text-dark-600">
            <span className="font-semibold">{chapter.owner.penname}</span>
          </p>
        </div>
      </div>
      <div className="my-3 px-8">
        {chapter.publishedAt && (
          <p className="mb-2 text-xs text-dark-400">
            publish: {chapter.publishedAt.toDateString()}
          </p>
        )}
        <EditorContent editor={editor} />
        <div className="z-10 flex items-center pt-3">
          <div className="pointer-events-none w-20">
            <LikeButton
              isAuthenticated={status === "authenticated"}
              isLiked={Boolean(isLike)}
              numberOfLike={chapter._count.likes}
            />
          </div>
          <div className="pointer-events-none w-20">
            <CommentButton numberOfComments={chapter._count.comments} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChapterFeed;
