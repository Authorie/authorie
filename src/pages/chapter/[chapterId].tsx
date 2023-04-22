import { BookStatus } from "@prisma/client";
import type { JSONContent } from "@tiptap/react";
import { EditorContent } from "@tiptap/react";
import type { GetStaticProps, InferGetStaticPropsType } from "next";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import type { ParsedUrlQuery } from "querystring";
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
import { generateSSGHelper } from "~/server/utils";
import { api, type RouterOutputs } from "~/utils/api";
import Custom404 from "../404";

export async function getStaticPaths() {
  const ssg = generateSSGHelper(null);
  const chapterIds = await ssg.chapter.getAllIds.fetch();
  return {
    paths: chapterIds.map(({ id }) => ({
      params: { chapterId: id },
    })),
    fallback: "blocking",
  };
}

type Props = {
  chapter: RouterOutputs["chapter"]["getData"];
  chapters: RouterOutputs["book"]["getData"] | null;
};

interface Params extends ParsedUrlQuery {
  chapterId: string;
}

export const getStaticProps: GetStaticProps<Props, Params> = async (
  context
) => {
  const ssg = generateSSGHelper(null);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const chapterId = context.params!.chapterId;
  try {
    const chapter = await ssg.chapter.getData.fetch({ id: chapterId });
    const chapters = chapter.bookId
      ? await ssg.book.getData.fetch({
          id: chapter.bookId,
        })
      : null;
    return {
      props: {
        chapter,
        chapters,
      },
      revalidate: 10,
    };
  } catch (err) {
    if (err instanceof Error) {
      console.log(err.message);
    } else {
      console.log("Unexpected Exception", err);
    }

    throw err;
  }
};

type props = InferGetStaticPropsType<typeof getStaticProps>;

const ChapterPage = ({ chapter, chapters }: props) => {
  const chapterIndex = chapters?.chapters.findIndex(
    (data) => chapter.id === data.id
  );
  const previousChapterId =
    chapterIndex &&
    chapterIndex - 1 !== undefined &&
    chapters?.chapters[chapterIndex - 1]?.id;
  const nextChapterId =
    chapterIndex &&
    chapterIndex + 1 !== undefined &&
    chapters?.chapters[chapterIndex + 1]?.id;
  const router = useRouter();
  const chapterId = router.query.chapterId as string;
  const [openBuyChapter, setOpenBuyChapter] = useState(false);
  const [openLogin, setOpenLogin] = useState(false);
  const [openComment, setOpenComment] = useState(false);
  const bookUnavailable =
    chapter.book?.status === (BookStatus.DRAFT || BookStatus.ARCHIVED);
  const chapterUnavailable =
    chapter.publishedAt === null || chapter.publishedAt > new Date();
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
    chapter && (chapter.price === 0 || chapter.chapterMarketHistories);
  const isOwner = chapter.ownerId === session?.user.id;

  useEffect(() => {
    if (!editor) return;
    if (!chapter) return;
    if (bookUnavailable || chapterUnavailable) return;
    if (status === "loading") return;
    if (!isChapterBought) {
      if (status === "unauthenticated") {
        setOpenLogin(true);
        return;
      }
      if (!isOwner) {
        setOpenBuyChapter(true);
        return;
      }
    }
    editor.commands.setContent(chapter.content as JSONContent);
  }, [
    editor,
    chapter,
    chapterId,
    isOwner,
    isChapterBought,
    status,
    session,
    bookUnavailable,
    chapterUnavailable,
  ]);

  useEffect(() => {
    if (status === "loading") return;
    if (bookUnavailable || chapterUnavailable) return;
    if (!isChapterBought) {
      if (status === "unauthenticated") {
        setOpenLogin(true);
        return;
      }
      if (!isOwner) {
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

  const copyToClipboard = () => {
    const url = window.location.origin + router.asPath;
    void navigator.clipboard.writeText(url);
    toast.success("URL Copied");
  };

  if (bookUnavailable && !isOwner) {
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
                href={`/${chapter.owner.penname as string}/book/${
                  chapter.bookId as string
                }`}
                className="text-lg font-semibold text-white hover:underline"
              >
                {chapter.book?.title}
              </Link>
              <h1 className="text-3xl font-semibold text-white">
                #{(chapterIndex as number) + 1} {chapter.title}
              </h1>
              <Link
                href={`/${chapter.owner.penname as string}`}
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
            {previousChapterId ? (
              <div
                onClick={() =>
                  void router.push(`/chapter/${previousChapterId}`)
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
                  isLiked={Boolean(isLiked)}
                  numberOfLike={chapter._count.likes || 0}
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
            {nextChapterId ? (
              <div
                onClick={() => void router.push(`/chapter/${nextChapterId}`)}
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
