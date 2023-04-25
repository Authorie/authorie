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
import dayjs from "dayjs";

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
  nextChapterId: string | null;
  previousChapterId: string | null;
};

interface Params extends ParsedUrlQuery {
  chapterId: string;
}

export const getStaticProps: GetStaticProps<Props, Params> = async (
  context
) => {
  const ssg = generateSSGHelper(null);
  const chapterId = context.params!.chapterId;
  const chapter = await ssg.chapter.getData.fetch({ id: chapterId });
  if (!chapter || !chapter.bookId || dayjs().isBefore(chapter.publishedAt)) {
    return {
      notFound: true,
    };
  }
  const book = await ssg.book.getData.fetch({
    id: chapter.bookId,
  });
  if (
    !book ||
    book.status === BookStatus.INITIAL ||
    book.status === BookStatus.DRAFT
  ) {
    return {
      notFound: true,
    };
  }
  let nextChapterId: string | null = null;
  let previousChapterId: string | null = null;
  if (chapter.chapterNo !== null && chapter.chapterNo > 0) {
    for (const ch of book.chapters) {
      if (!ch.chapterNo) continue;
      const diff = ch.chapterNo - chapter.chapterNo;
      if (diff === 1) {
        nextChapterId = ch.id;
      } else if (diff === -1) {
        previousChapterId = ch.id;
      }
    }
  }
  return {
    props: {
      chapter,
      nextChapterId,
      previousChapterId,
    },
    revalidate: 10,
  };
};

type props = InferGetStaticPropsType<typeof getStaticProps>;

// checkChapterReadable
// return false means the chapter is not readable (no book, not owner, book is draft or archived, valid book state but not free)
// return true means the chapter is readable (owner, book is published or completed and free)
const checkChapterReadable = (
  chapter: props["chapter"],
  userId: string | undefined
) => {
  if (!chapter || !chapter.book) {
    return false;
  }

  const isOwner =
    chapter.ownerId === userId ||
    chapter.book.owners.some(({ user: owner }) => owner.id === userId) ||
    chapter.chapterMarketHistories.some((history) => history.userId === userId);
  if (isOwner) {
    return true;
  }

  switch (chapter.book.status) {
    case BookStatus.PUBLISHED:
    case BookStatus.COMPLETED:
      return chapter.price === 0;
    case BookStatus.ARCHIVED:
      return false;
  }
};

const ChapterPage = ({ chapter, previousChapterId, nextChapterId }: props) => {
  const utils = api.useContext();
  const router = useRouter();
  const { data: session, status } = useSession();
  const chapterId = router.query.chapterId as string;
  const [open404, setOpen404] = useState(false);
  const [openLogin, setOpenLogin] = useState(false);
  const [openComment, setOpenComment] = useState(false);
  const [openBuyChapter, setOpenBuyChapter] = useState(false);
  const [isChapterReadable, setIsChapterReadable] = useState(
    checkChapterReadable(chapter, session?.user.id)
  );
  const editor = useEditor("The content cannot be shown...", false);
  const { data: isLiked } = api.chapter.isLike.useQuery(
    {
      id: chapterId,
    },
    { enabled: status === "authenticated" && router.isReady }
  );
  const {
    data: comments,
    isSuccess,
    isLoading: isLoadingComment,
  } = api.comment.getAll.useQuery({
    chapterId: chapterId,
  });

  const { mutate: readChapterMutate } = api.chapter.read.useMutation();
  const likeMutation = api.chapter.like.useMutation({
    onMutate: async () => {
      await utils.chapter.isLike.cancel();
      const previousLike = utils.chapter.isLike.getData();
      const previousNumberOfLikes = chapter._count.likes;
      utils.chapter.isLike.setData({ id: chapterId }, (old) => !old);
      chapter._count.likes += 1;
      return { previousLike, previousNumberOfLikes };
    },
    onError(error, variables, context) {
      if (context?.previousLike) {
        utils.chapter.isLike.setData({ id: chapterId }, context.previousLike);
      }
      if (context?.previousNumberOfLikes) {
        chapter._count.likes = context.previousNumberOfLikes;
      }
    },
    onSettled: () => {
      void utils.chapter.isLike.invalidate({ id: chapterId });
    },
  });
  const unlikeMutation = api.chapter.unlike.useMutation({
    onMutate: async () => {
      await utils.chapter.isLike.cancel();
      const previousLike = utils.chapter.isLike.getData();
      const previousNumberOfLikes = chapter._count.likes;
      utils.chapter.isLike.setData({ id: chapterId }, (old) => !old);
      chapter._count.likes -= 1;
      return { previousLike, previousNumberOfLikes };
    },
    onError(error, variables, context) {
      if (context?.previousLike) {
        utils.chapter.isLike.setData({ id: chapterId }, context.previousLike);
      }
      if (context?.previousNumberOfLikes) {
        chapter._count.likes = context.previousNumberOfLikes;
      }
    },
    onSettled: () => {
      void utils.chapter.isLike.invalidate({ id: chapterId });
    },
  });

  useEffect(() => {
    setIsChapterReadable(checkChapterReadable(chapter, session?.user.id));
  }, [chapter, session?.user.id]);
  useEffect(() => {
    if (editor && isChapterReadable) {
      editor.commands.setContent(chapter.content as JSONContent);
    }
  }, [chapter, editor, isChapterReadable]);
  useEffect(() => {
    if (!isChapterReadable) {
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
  }, [chapter.book, isChapterReadable, status]);
  useEffect(() => {
    if (!router.isReady) return;
    readChapterMutate({ id: chapterId });
  }, [router.isReady, readChapterMutate, chapterId]);

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
