import ChapterCommentInput from "@components/Comment/ChapterCommentInput";
import { BookStatus } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { api } from "@utils/api";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
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
import FontFamily from "@tiptap/extension-font-family";
import Underline from "@tiptap/extension-underline";
import { Heading } from "@components/Create/Chapter/TextEditorMenu/Heading";
import type { JSONContent } from "@tiptap/react";
import { EditorContent } from "@tiptap/react";
import { useEffect } from "react";
import Comment from "@components/Comment/Comment";
import { createInnerTRPCContext } from "@server/api/trpc";
import { getServerAuthSession } from "@server/auth";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { appRouter } from "@server/api/root";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import superjson from "superjson";
import { useState } from "react";
import ReadChapterPopover from "@components/Chapter/ReadChapterMenu/ReadChapterPopover";

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getServerAuthSession(context);
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: createInnerTRPCContext({ session }),
    transformer: superjson,
  });
  const chapterId = context.query.chapterId as string;
  await ssg.chapter.getData.prefetch({ id: chapterId });
  await ssg.comment.getAll.prefetch({ chapterId: chapterId });
  await ssg.chapter.isLike.prefetch({ id: chapterId });
  await ssg.chapter.getChapterLikes.prefetch({ id: chapterId });
  return {
    props: {
      trpcState: ssg.dehydrate(),
      session,
      chapterId,
    },
  };
};

type props = InferGetServerSidePropsType<typeof getServerSideProps>;

const ChapterPage = ({ session, chapterId }: props) => {
  const router = useRouter();
  const { status } = useSession();
  const utils = api.useContext();
  const { data: chapter } = api.chapter.getData.useQuery({
    id: chapterId,
  });
  const { data: book } = api.book.getData.useQuery({
    id: chapter?.bookId as string,
  });
  const { data: isLike } = api.comment.isLike.useQuery({
    id: chapterId,
  });
  const [isLiked, setIsLiked] = useState(isLike);
  const readChapter = api.chapter.read.useMutation({
    onSuccess() {
      void utils.chapter.invalidate();
    },
    onSettled: () => {
      void utils.chapter.invalidate();
    },
  });
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
      StarterKit.configure({
        heading: false,
        paragraph: {
          HTMLAttributes: {
            class: "text-[length:var(--editor-h2)]",
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
      console.log("changed!");
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (!chapter) return;
    editor.commands.setContent(chapter.content as JSONContent);
  }, [chapter, editor]);

  useEffect(() => {
    readChapter.mutate({ id: chapterId });
  }, []);

  useEffect(() => {
    setIsLiked(isLike);
  }, [isLike]);

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
    if (isLiked) {
      setIsLiked(false);
      unlikeMutation.mutate({ id: chapterId });
      return;
    } else {
      setIsLiked(true);
      likeMutation.mutate({ id: chapterId });
      return;
    }
  };

  return (
    <div className="relative flex h-screen w-full flex-col">
      {chapter &&
      book &&
      (book.status === BookStatus.PUBLISHED ||
        book.status === BookStatus.COMPLETED) ? (
        <div className="overflow-y-scroll">
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
              <ChevronLeftIcon className="h-7 w-7 cursor-pointer rounded-full bg-gray-500 p-1 text-white hover:bg-gray-700" />
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
            <div className="flex cursor-pointer items-center gap-2 rounded-full px-3 py-2 hover:bg-slate-100">
              <ArrowTopRightOnSquareIcon className="h-6 w-6" />
            </div>
            <ReadChapterPopover editor={editor} />
            <div className="mx-10">
              <ChevronRightIcon className="h-7 w-7 cursor-pointer rounded-full bg-gray-500 p-1 text-white hover:bg-gray-700" />
            </div>
          </div>

          <div className="relative mb-16 mt-0 flex grow justify-between p-4">
            <div className="w-[800px]">
              <EditorContent editor={editor} />
            </div>
            <div className="sticky max-h-96 min-h-fit w-80 overflow-y-auto rounded-lg bg-gray-400 px-2">
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
