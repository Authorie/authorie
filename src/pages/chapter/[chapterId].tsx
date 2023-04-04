import ReadChapterPopover from "@components/Chapter/ReadChapterMenu/ReadChapterPopover";
import ChapterCommentInput from "@components/Comment/ChapterCommentInput";
import Comment from "@components/Comment/Comment";
import { Heading } from "@components/Create/Chapter/TextEditorMenu/Heading";
import { ChapterLikeButton } from "@components/action/ChapterLikeButton";
import { BookStatus } from "@prisma/client";
import { getServerAuthSession } from "@server/auth";
import { generateSSGHelper } from "@server/utils";
import CharacterCount from "@tiptap/extension-character-count";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TextStyle from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import type { JSONContent } from "@tiptap/react";
import { EditorContent, useEditor } from "@tiptap/react";
import BulletList from "@tiptap/extension-bullet-list";
import Document from "@tiptap/extension-document";
import HardBreak from "@tiptap/extension-hard-break";
import ListItem from "@tiptap/extension-list-item";
import OrderedList from "@tiptap/extension-ordered-list";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Strike from "@tiptap/extension-strike";
import Dropcursor from "@tiptap/extension-dropcursor";
import Gapcursor from "@tiptap/extension-gapcursor";
import History from "@tiptap/extension-history";

import { api } from "@utils/api";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import {
  HiOutlineArrowTopRightOnSquare,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi2";

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getServerAuthSession(context);
  const ssg = generateSSGHelper(session);
  const chapterId = context.query.chapterId as string;
  await Promise.all([
    ssg.chapter.getData.prefetch({ id: chapterId }),
    ssg.comment.getAll.prefetch({ chapterId: chapterId }),
    ssg.chapter.isLike.prefetch({ id: chapterId }),
  ]);
  return {
    props: {
      trpcState: ssg.dehydrate(),
      session,
      chapterId,
    },
  };
};

type props = InferGetServerSidePropsType<typeof getServerSideProps>;

const ChapterPage = ({ chapterId }: props) => {
  const { status } = useSession();
  const utils = api.useContext();
  const { data: chapter } = api.chapter.getData.useQuery({
    id: chapterId,
  });
  const { data: isLiked } = api.chapter.isLike.useQuery({
    id: chapterId,
  });
  const readChapter = api.chapter.read.useMutation();
  const {
    data: comments,
    isSuccess,
    isLoading,
  } = api.comment.getAll.useQuery({
    chapterId: chapterId,
  });
  const editor = useEditor({
    content: "",
    extensions: [
      Document,
      HardBreak,
      ListItem,
      Text,
      Bold,
      Italic,
      Strike,
      Dropcursor,
      Gapcursor,
      History,
      Paragraph.configure({
        HTMLAttributes: {
          class: "text-[length:var(--editor-h2)]",
        },
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: "list-disc px-4",
        },
      }),

      OrderedList.configure({
        HTMLAttributes: {
          class: "list-decimal px-4",
        },
      }),
      Underline,
      Heading,
      Highlight,
      TextStyle,
      FontFamily,
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
    autofocus: false,
    onUpdate: ({ editor }) => {
      localStorage.setItem(chapterId, JSON.stringify(editor.getJSON()));
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (!chapter) return;
    if (!localStorage) return;
    const localData = localStorage.getItem(chapterId);
    if (localData) {
      editor.commands.setContent(JSON.parse(localData) as JSONContent);
    } else {
      editor.commands.setContent(chapter.content as JSONContent);
    }
  }, [editor, chapter, chapterId]);

  useEffect(() => {
    readChapter.mutate({ id: chapterId });
  }, []);

  const likeMutation = api.chapter.like.useMutation({
    onMutate: async () => {
      await utils.chapter.isLike.cancel();
      const previousLike = utils.chapter.isLike.getData();
      utils.chapter.isLike.setData({ id: chapterId }, (old) => !old);
      return { previousLike };
    },
    onSettled: () => {
      void utils.chapter.isLike.invalidate({ id: chapterId });
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
      void utils.chapter.isLike.invalidate({ id: chapterId });
    },
  });

  const onLikeHandler = () => {
    if (
      isLiked === undefined ||
      likeMutation.isLoading ||
      unlikeMutation.isLoading
    )
      return;
    if (isLiked) {
      unlikeMutation.mutate({ id: chapterId });
    } else {
      likeMutation.mutate({ id: chapterId });
    }
  };

  return (
    <div className="relative flex h-screen w-full flex-col">
      {chapter && chapter.book && chapter.book.status !== BookStatus.DRAFT ? (
        <div className="flex h-full flex-col overflow-y-scroll">
          <div className="flex h-fit w-full bg-authGreen-500 p-3">
            <div className="ml-8 flex flex-col">
              <h2 className="text-lg font-semibold text-white">
                {chapter.book?.title}
              </h2>
              <h1 className="text-3xl font-semibold text-white">
                #1 {chapter.title}
              </h1>
              <h3 className="mt-2 text-sm text-white">
                {chapter.owner.penname}
              </h3>
              <h4 className="mt-2 text-xs text-white">
                {chapter.publishedAt?.toDateString()}
              </h4>
            </div>
          </div>
          <div className="sticky top-0 z-10 flex h-12 w-full items-center justify-between rounded-b-xl bg-authGreen-600 p-2">
            <div className="mx-10">
              <HiOutlineChevronLeft className="h-7 w-7 cursor-pointer rounded-full bg-gray-500 p-1 text-white hover:bg-gray-700" />
            </div>
            {status === "authenticated" && (
              <div className="flex w-1/2 items-center justify-center">
                <ChapterLikeButton
                  isAuthenticated={status === "authenticated"}
                  isLiked={Boolean(isLiked)}
                  numberOfLike={chapter?._count.likes || 0}
                  onClickHandler={onLikeHandler}
                />
                <ChapterCommentInput chapterId={chapterId} />
              </div>
            )}
            <ReadChapterPopover editor={editor} />
            <div className="flex cursor-pointer items-center gap-2 rounded-full px-2 py-1 hover:bg-gray-500">
              <HiOutlineArrowTopRightOnSquare className="h-5 w-5 text-white" />
            </div>
            <div className="mx-10">
              <HiOutlineChevronRight className="h-7 w-7 cursor-pointer rounded-full bg-gray-500 p-1 text-white hover:bg-gray-700" />
            </div>
          </div>
          <div className="relative mt-0 flex h-full justify-between px-4">
            <div className="w-[800px] py-4">
              <EditorContent editor={editor} />
            </div>
            <div className="sticky grow overflow-y-auto bg-gray-200 px-2 py-1">
              {comments && comments.length !== 0 ? (
                <div>
                  {isSuccess &&
                    comments.map((comment) => (
                      <Comment key={comment.id} comment={comment} />
                    ))}
                  {isLoading && (
                    <div className="flex items-center justify-center rounded-full text-white">
                      <svg
                        className="... h-5 w-5 animate-spin"
                        viewBox="0 0 24 24"
                      ></svg>
                      Processing...
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-xl font-semibold text-white">
                  <p>No comments</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex h-full items-center justify-center text-3xl font-bold">
          This chapter does not exist
        </div>
      )}
    </div>
  );
};

export default ChapterPage;
