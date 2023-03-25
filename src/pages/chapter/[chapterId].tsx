import ChapterCommentInput from "@components/Comment/ChapterCommentInput";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { api } from "@utils/api";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { ChapterLikeButton } from "@components/action/ChapterLikeButton";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import CharacterCount from "@tiptap/extension-character-count";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TextStyle from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { Heading } from "@components/Create/Chapter/TextEditorMenu/Heading";
import type { JSONContent } from "@tiptap/react";
import { EditorContent } from "@tiptap/react";
import { useEffect } from "react";

const ChapterPage = () => {
  const router = useRouter();
  const { status } = useSession();
  const utils = api.useContext();
  const { chapterId } = router.query;
  const { data: chapter } = api.chapter.getData.useQuery({
    id: chapterId as string,
  });
  const { data: isLike } = api.comment.isLike.useQuery({
    id: chapterId as string,
  });
  const editor = useEditor({
    content: "",
    extensions: [
      StarterKit.configure({
        heading: false,
        paragraph: {
          HTMLAttributes: {
            class: "text-base",
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: "list-disc px-4",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal px-4",
          },
        },
      }),
      Underline,
      Heading,
      Highlight,
      TextStyle,
      Color,
      Link.configure({
        HTMLAttributes: {
          class:
            "rounded shadow-md bg-white p-1 hover:underline hover:bg-slate-100 text-blue-500",
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class:
            "border-collapse m-0 select-all overflow-hidden w-full table-auto",
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: "select-all",
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class:
            "border-slate-500 border-2 border-solid bg-slate-200 relative text-left select-all",
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class:
            "border-slate-500 border-2 border-solid w-20 text-left select-all",
        },
      }),
      Image,
      CharacterCount,
    ],
    editorProps: {
      attributes: {
        class: "px-4",
      },
    },
    editable: false,
  });

  useEffect(() => {
    if (!editor) return;
    if (chapter !== undefined) {
      editor.commands.setContent(chapter.content as JSONContent);
      return;
    }
  }, [chapter, editor]);

  const likeMutation = api.chapter.like.useMutation({
    onMutate: async () => {
      await utils.chapter.isLike.cancel();
      const previousLike = utils.chapter.isLike.getData();
      utils.chapter.isLike.setData({ id: chapterId as string }, (old) => !old);
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
      utils.chapter.isLike.setData({ id: chapterId as string }, (old) => !old);
      return { previousLike };
    },
    onSettled: () => {
      void utils.book.invalidate();
    },
  });

  const onLikeHandler = () => {
    if (likeMutation.isLoading && unlikeMutation.isLoading) return;
    if (isLike) {
      unlikeMutation.mutate({ id: chapterId as string });
    } else {
      likeMutation.mutate({ id: chapterId as string });
    }
  };

  return (
    <div className="relative flex h-full w-full flex-col">
      {true ? (
        <>
          <div className="absolute top-0 flex h-fit w-full bg-gray-500 p-3">
            <div className="ml-8 flex flex-col">
              <h2 className="text-white">Book</h2>
              <h1 className="text-3xl font-semibold text-white">
                #1 Chapter title
              </h1>
              <h3 className="mt-2 text-sm text-white">author</h3>
              <h4 className="mt-2 text-xs text-white">publish date</h4>
            </div>
          </div>
          <div className="mt-32 flex grow justify-between p-4">
            <EditorContent editor={editor} />
            <div>comment</div>
          </div>
          <div className="absolute bottom-0 flex h-16 w-full items-center justify-between bg-authGreen-500 p-2">
            <div className="mx-10">
              <ChevronLeftIcon className="h-9 w-9 cursor-pointer rounded-full bg-gray-500 p-1 text-white hover:bg-gray-700" />
            </div>
            {status === "authenticated" && (
              <div className="flex w-1/2 items-center justify-center">
                <ChapterLikeButton
                  isAuthenticated={status === "authenticated"}
                  isLike={Boolean(isLike)}
                  numberOfLike={chapter?._count.likes || 0}
                  onClickHandler={onLikeHandler}
                />
                <ChapterCommentInput chapterId={chapterId as string} />
              </div>
            )}
            <div className="mx-10">
              <ChevronRightIcon className="h-9 w-9 cursor-pointer rounded-full bg-gray-500 p-1 text-white hover:bg-gray-700" />
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center">
          This chapter does not exist
        </div>
      )}
    </div>
  );
};

export default ChapterPage;
