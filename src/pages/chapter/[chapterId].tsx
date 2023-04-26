import { BookStatus } from "@prisma/client";
import type { JSONContent } from "@tiptap/react";
import { EditorContent } from "@tiptap/react";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  HiOutlineArrowTopRightOnSquare,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi2";
import ReadChapterPopover from "~/components/Chapter/ReadChapterMenu/ReadChapterPopover";
import ChapterCommentInput from "~/components/Comment/ChapterCommentInput";
import Comment from "~/components/Comment/Comment";
import DialogBuyChapter from "~/components/Dialog/DialogBuyChapter";
import DialogLayout from "~/components/Dialog/DialogLayout";
import { ChapterLikeButton } from "~/components/action/ChapterLikeButton";
import { DateLabel } from "~/components/action/DateLabel";
import { useEditor } from "~/hooks/editor";
import { api } from "~/utils/api";
import Custom404 from "../404";

const ChapterPage = () => {
  const router = useRouter();
  const utils = api.useContext();
  const { status } = useSession();
  const chapterId = router.query.chapterId as string;
  const [open404, setOpen404] = useState(false);
  const [openLogin, setOpenLogin] = useState(false);
  const [readChapter, setReadChapter] = useState(false);
  const [openComment, setOpenComment] = useState(false);
  const [openBuyChapter, setOpenBuyChapter] = useState(false);
  const { data: chapter, isLoading: chapterLoading } =
    api.chapter.getData.useQuery(
      { id: chapterId },
      { enabled: router.isReady }
    );
  const editor = useEditor("The content cannot be shown...", false);
  const { data: commentIds, isLoading: commentIdsLoading } =
    api.comment.getAll.useQuery(
      {
        chapterId,
      },
      {
        enabled: router.isReady,
      }
    );
  const comments = api.useQueries(
    (t) => commentIds?.map((commentId) => t.comment.getData(commentId)) ?? []
  );
  const commentsLoading = comments.some(({ isLoading }) => isLoading);

  const { mutate: readChapterMutate } = api.chapter.read.useMutation();
  const likeMutation = api.chapter.like.useMutation({
    async onMutate(variables) {
      await utils.chapter.getData.cancel();
      const previousChapter = utils.chapter.getData.getData(variables);
      utils.chapter.getData.setData(variables, (old) => {
        if (!old) return old;
        return {
          ...old,
          isLiked: true,
          _count: {
            ...old._count,
            likes: old._count.likes + 1,
          },
        };
      });
      return { previousChapter };
    },
    onSettled(_data, error, variables, context) {
      if (error && context?.previousChapter) {
        utils.chapter.getData.setData(variables, context.previousChapter);
      }
      void utils.chapter.getData.invalidate(variables);
    },
  });
  const unlikeMutation = api.chapter.unlike.useMutation({
    async onMutate(variables) {
      await utils.chapter.getData.cancel();
      const previousChapter = utils.chapter.getData.getData(variables);
      utils.chapter.getData.setData(variables, (old) => {
        if (!old) return old;
        return {
          ...old,
          isLiked: false,
          _count: {
            ...old._count,
            likes: old._count.likes - 1,
          },
        };
      });
      return { previousChapter };
    },
    onSettled(_data, error, variables, context) {
      if (error && context?.previousChapter) {
        utils.chapter.getData.setData(variables, context.previousChapter);
      }
      void utils.chapter.getData.invalidate(variables);
    },
  });
  useEffect(() => {
    if (editor && chapter?.isChapterReadable) {
      editor.commands.setContent(chapter.content as JSONContent);
    }
  }, [chapter, editor, chapter?.isChapterReadable]);
  useEffect(() => {
    if (chapterLoading || !chapter) return;
    if (!chapter.isChapterReadable) {
      setOpen404(() => {
        if (!chapter.book) return true;
        return ![BookStatus.PUBLISHED, BookStatus.COMPLETED].includes(
          chapter.book.status
        );
      });
      setOpenLogin(status === "unauthenticated");
      setOpenBuyChapter(status === "authenticated");
    }
    return () => {
      setOpen404(false);
      setOpenLogin(false);
      setOpenBuyChapter(false);
    };
  }, [chapter, chapterLoading, status]);
  useEffect(() => {
    if (readChapter) return;
    if (!router.isReady) return;
    setReadChapter(true);
    readChapterMutate({ id: chapterId });
  }, [router.isReady, chapterId, readChapter, readChapterMutate]);

  const onLikeHandler = () => {
    if (
      chapter === undefined ||
      likeMutation.isLoading ||
      unlikeMutation.isLoading
    )
      return;
    if (chapter.isLiked) {
      unlikeMutation.mutate({ id: chapterId });
    } else {
      likeMutation.mutate({ id: chapterId });
    }
  };
  const copyToClipboard = () => {
    const url = window.location.origin + router.asPath;
    void navigator.clipboard.writeText(url);
    toast.success("URL Copied");
  };

  if (open404) {
    return <Custom404 />;
  }

  return (
    <div className="relative flex h-screen w-full flex-col">
      {chapter && chapter.book ? (
        <div className="flex h-full flex-col items-center overflow-y-scroll">
          {chapter.price > 0 && (
            <div className="absolute right-5 top-4 z-20 flex items-center gap-1 rounded-full bg-white px-2 py-1">
              <Image
                src="/authorie_coin_logo.svg"
                alt="Authorie coin logo"
                width={30}
                height={30}
                className="h-5 w-5"
              />
              <p className="text-sm font-semibold text-authYellow-500">
                {chapter.price}
              </p>
            </div>
          )}
          <DialogLayout
            isOpen={openComment}
            closeModal={() => setOpenComment(false)}
          >
            {commentIds && commentIds.length === 0 && (
              <div className="flex h-full items-center justify-center text-xl font-semibold text-white">
                <p>No comments</p>
              </div>
            )}
            {commentIdsLoading ||
              (commentsLoading && (
                <div className="flex items-center justify-center rounded-full text-white">
                  <svg
                    className="... h-5 w-5 animate-spin"
                    viewBox="0 0 24 24"
                  />
                  Processing...
                </div>
              ))}
            {!commentsLoading &&
              comments.map(({ data: comment }) => (
                <Comment key={comment!.id} comment={comment!} />
              ))}
          </DialogLayout>
          <DialogLayout
            isOpen={openLogin}
            closeModal={() => setOpenLogin(false)}
            openLoop={() => setOpenLogin(true)}
            title="You still have not sign in yet!"
            description="Please sign in before access this content."
          >
            <button
              onClick={() => void signIn()}
              className="focus:outlone-none justify-center gap-4 rounded-lg bg-green-700 px-3 py-1 text-white outline-none hover:bg-green-800"
            >
              Sign in now!
            </button>
          </DialogLayout>
          <DialogBuyChapter
            title={chapter.title}
            price={chapter.price}
            bookId={chapter.bookId}
            chapterId={chapter.id}
            isOpen={openBuyChapter}
            closeModal={() => setOpenBuyChapter(false)}
            cancelClick={() => void router.push("/")}
            cancelTitle="Exit"
            openLoop={() => setOpenBuyChapter(true)}
          />
          <div className="flex h-fit w-full bg-authGreen-500 p-3">
            <div className="ml-8 flex flex-col">
              <Link
                href={`/${chapter.owner.penname!}/book/${chapter.bookId!}`}
                className="text-lg font-semibold text-white hover:underline"
              >
                {chapter.book?.title}
              </Link>
              <h1 className="text-3xl font-semibold text-white">
                #{chapter.chapterNo ?? 0} {chapter.title}
              </h1>
              <Link
                href={`/${chapter.owner.penname!}`}
                className="mt-2 cursor-pointer font-semibold text-white hover:underline"
              >
                {chapter.owner.penname}
              </Link>
              <div className="mt-2">
                <DateLabel
                  date={chapter.publishedAt as Date}
                  withTime={false}
                  publishedLabel
                  hover
                  color={"white"}
                />
              </div>
            </div>
          </div>
          <div className="sticky top-0 z-10 flex h-12 w-full items-center justify-between rounded-b-xl bg-authGreen-600 p-2">
            {chapter.previousChapterId ? (
              <div
                onClick={() =>
                  void router.push(`/chapter/${chapter.previousChapterId!}`)
                }
                className="mx-10"
              >
                <HiOutlineChevronLeft className="h-7 w-7 cursor-pointer rounded-full bg-gray-500 p-1 text-white hover:bg-gray-700" />
              </div>
            ) : (
              <div className="mx-10 h-7 w-7"></div>
            )}
            {status === "authenticated" && (
              <div className="flex w-1/2 items-center justify-center">
                <ChapterLikeButton
                  isAuthenticated={status === "authenticated"}
                  isLiked={chapter.isLiked}
                  numberOfLike={chapter._count.likes ?? 0}
                  onClickHandler={onLikeHandler}
                />
                <ChapterCommentInput chapterId={chapterId} />
              </div>
            )}
            <button
              onClick={() => setOpenComment(true)}
              className="rounded-lg border border-white px-3 py-1 text-sm font-semibold text-white hover:bg-slate-400"
            >
              Open Comment
            </button>
            <ReadChapterPopover editor={editor} />
            <div
              onClick={copyToClipboard}
              className="flex cursor-pointer items-center gap-2 rounded-full px-2 py-1 hover:bg-gray-500"
            >
              <HiOutlineArrowTopRightOnSquare className="h-5 w-5 text-white" />
            </div>
            {chapter.nextChapterId ? (
              <div
                onClick={() =>
                  void router.push(`/chapter/${chapter.nextChapterId!}`)
                }
                className="mx-10 cursor-pointer rounded-full 
                  bg-gray-500 text-white hover:bg-gray-700"
              >
                <HiOutlineChevronRight className="h-7 w-7 p-1" />
              </div>
            ) : (
              <div className="mx-10 h-7 w-7"></div>
            )}
          </div>
          <div className="my-6 h-fit w-[800px] rounded-lg bg-white px-10 py-4">
            <EditorContent editor={editor} />
          </div>
        </div>
      ) : (
        <div className="flex h-full items-center justify-center text-3xl font-bold">
          isLoading
        </div>
      )}
    </div>
  );
};

export default ChapterPage;
