import type { Content } from "@tiptap/react";
import { EditorContent } from "@tiptap/react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
import { HiLockClosed } from "react-icons/hi2";
import { CommentButton, LikeButton } from "~/components/action";
import { useEditor } from "~/hooks/editor";
import { api, type RouterOutputs } from "~/utils/api";
import DialogBuyChapter from "../Dialog/DialogBuyChapter";
import { DateLabel } from "../action/DateLabel";

type props = {
  chapter: RouterOutputs["chapter"]["getData"];
};

const ChapterFeed = ({ chapter }: props) => {
  const router = useRouter();
  const { status, data: session } = useSession();
  const [openBuyChapter, setOpenBuyChapter] = useState(false);
  const isOwner = session?.user.id === chapter.owner.id;
  const isChapterBought =
    chapter.price === 0 ||
    chapter.chapterMarketHistories.some(
      (history) => history.userId === session?.user.id
    );
  const editor = useEditor(chapter.content as Content, false);
  const { data: isLike } = api.comment.isLike.useQuery(
    { id: chapter.id },
    { enabled: status === "authenticated" }
  );

  const clickCardHandler = () => {
    if (!isOwner && !isChapterBought) {
      setOpenBuyChapter(true);
    } else {
      void router.push(`/chapter/${chapter.id}`);
    }
  };

  return (
    <>
      <DialogBuyChapter
        title={chapter.title}
        price={chapter.price}
        chapterId={chapter.id}
        isOpen={openBuyChapter}
        closeModal={() => setOpenBuyChapter(false)}
      />
      <div
        onClick={clickCardHandler}
        className="group/items relative max-w-5xl cursor-pointer overflow-hidden rounded-xl bg-white shadow-md transition duration-100 ease-in-out"
      >
        {chapter.price > 0 && (
          <div className="absolute right-2 top-2 z-20 flex items-center gap-1 rounded-full bg-white px-1">
            <Image
              src="/authorie_coin_logo.svg"
              alt="Authorie coin logo"
              width={30}
              height={30}
              className="h-4 w-4"
            />
            <p className="text-sm text-authYellow-500">{chapter.price}</p>
          </div>
        )}
        {((status !== "authenticated" && chapter.price > 0) ||
          (!isOwner && !isChapterBought)) && (
            <>
              <div className="absolute left-0 top-0 z-20 h-full w-full bg-black/70">
                <div className="flex h-full w-full items-center justify-center gap-4 text-white">
                  <HiLockClosed className="h-5 w-5" />
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{chapter.price}</p>
                    <Image
                      src="/authorie_coin_logo.svg"
                      alt="Authorie coin logo"
                      width={30}
                      height={30}
                      className="h-5 w-5"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        <div className="invisible absolute z-20 h-full w-full bg-black/20 group-hover/items:visible" />
        <div className="relative flex h-40 flex-col justify-center overflow-hidden px-8">
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-white via-white/80 to-transparent" />
          <div className="absolute inset-0">
            {chapter.book?.wallpaperImage ? (
              <Image
                src={chapter.book.wallpaperImage}
                alt="wallpaper"
                width={2000}
                height={110}
              />
            ) : (
              <div className="h-full w-full bg-authGreen-500"></div>
            )}
          </div>
          <div className="z-10">
            <h2 className="my-1 text-3xl font-bold">{chapter.title}</h2>
            {chapter.book && (
              <h3 className="text-dark-400">book: {chapter.book.title}</h3>
            )}
            <p className="py-2 text-sm text-dark-600">
              by
              <span className="font-semibold"> {chapter.owner.penname}</span>
            </p>
          </div>
        </div>
        <div className="my-3 px-8">
          {chapter.publishedAt && (
            <DateLabel
              date={chapter.publishedAt}
              withTime={false}
              publishedLabel
            />
          )}
          <div className="py-3">
            <EditorContent editor={editor} />
          </div>
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
    </>
  );
};

export default ChapterFeed;
