import { BookStatus } from "@prisma/client";
import type { JSONContent } from "@tiptap/react";
import { EditorContent } from "@tiptap/react";
import { type GetStaticPropsContext, type InferGetStaticPropsType } from "next";
import { useSession, signIn, SessionContext } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import DialogBuyChapter from "~/components/Dialog/DialogBuyChapter";
import {
  HiOutlineArrowTopRightOnSquare,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi2";
import ReadChapterPopover from "~/components/Chapter/ReadChapterMenu/ReadChapterPopover";
import ChapterCommentInput from "~/components/Comment/ChapterCommentInput";
import Comment from "~/components/Comment/Comment";
import { ChapterLikeButton } from "~/components/action/ChapterLikeButton";
import { useEditor } from "~/hooks/editor";
import { generateSSGHelper } from "~/server/utils";
import { api } from "~/utils/api";
import DialogLayout from "~/components/Dialog/DialogLayout";

export async function getStaticPaths() {
  const ssg = generateSSGHelper(null);
  const chapterIds = await ssg.chapter.getAllIds.fetch();
  return {
    paths: chapterIds.map(({ id }) => ({
      params: { chapterId: id },
    })),
    fallback: false,
  };
}

export async function getStaticProps({ params }: GetStaticPropsContext) {
  if (!params) return { props: {} };
  const ssg = generateSSGHelper(null);
  const chapterId = params.chapterId as string;
  const chapter = await ssg.chapter.getData.fetch({ id: chapterId });
  return {
    props: {
      chapter,
    },
    revalidate: 10,
  };
}

type props = InferGetStaticPropsType<typeof getStaticProps>;

const ChapterPage = ({ chapter }: props) => {
  const router = useRouter();
  const chapterId = router.query.chapterId as string;
  const [openBuyChapter, setOpenBuyChapter] = useState(false);
  const [openLogin, setOpenLogin] = useState(false);
  const { data: session, status } = useSession();
  const utils = api.useContext();
  const { data: isLiked } = api.chapter.isLike.useQuery(
    {
      id: chapterId,
    },
    { enabled: status === "authenticated" }
  );
  const readChapter = api.chapter.read.useMutation();
  const {
    data: comments,
    isSuccess,
    isLoading: isLoadingComment,
  } = api.comment.getAll.useQuery({
    chapterId: chapterId,
  });
  const editor = useEditor("The content cannot be shown...", false);
  const isChapterBought =
    chapter &&
    (chapter.price === 0 || chapter.chapterMarketHistories.length > 0);
  const isOwner = chapter?.ownerId === session?.user.id;

  useEffect(() => {
    if (!editor) return;
    if (!chapter) return;
    if (!isOwner && !isChapterBought) {
      if (!session && status !== "loading") {
        setOpenBuyChapter(false);
        setOpenLogin(true);
        return;
      } else if (session) {
        setOpenLogin(false);
        setOpenBuyChapter(true);
        return;
      } else {
        return;
      }
    }
    editor.commands.setContent(chapter.content as JSONContent);
  }, [editor, chapter, chapterId, isOwner, isChapterBought, status, session]);

  useEffect(() => {
    if (!isOwner && !isChapterBought) {
      if (!session) {
        setOpenLogin(true);
        return;
      } else {
        setOpenBuyChapter(true);
        return;
      }
    }
    readChapter.mutate({ id: chapterId });

    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            chapterId={chapter.id}
            isOpen={openBuyChapter}
            closeModal={() => setOpenBuyChapter(false)}
            cancelClick={() => void router.push("/")}
            cancelTitle="Exit"
            openLoop={() => setOpenBuyChapter(true)}
          />
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
                  {isLoadingComment && (
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
          isLoading
        </div>
      )}
    </div>
  );
};

export default ChapterPage;
