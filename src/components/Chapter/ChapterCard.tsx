import dayjs from "dayjs";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import type { MouseEvent } from "react";
import { useEffect, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import { HiEye, HiHeart, HiLockClosed, HiPencil } from "react-icons/hi2";
import { twJoin } from "tailwind-merge";
import { type RouterOutputs } from "~/utils/api";
import DialogBuyChapter from "../Dialog/DialogBuyChapter";
import { DateLabel } from "../action/DateLabel";

type props = {
  chapter: RouterOutputs["book"]["getData"]["chapters"][number];
  moveChapter: (id: string, atIndex: number) => void;
  findChapter: (id: string) => {
    card?: RouterOutputs["book"]["getData"]["chapters"][number];
    index: number;
  };
  chapterNo: number;
  isEdit: boolean;
};

const ChapterCard = ({
  chapter,
  moveChapter,
  findChapter,
  chapterNo,
  isEdit,
}: props) => {
  const router = useRouter();
  const [openBuyChapter, setOpenBuyChapter] = useState(false);
  const { data: session, status } = useSession();
  const isOwner = session?.user.id === chapter.ownerId;
  const editable =
    chapter.publishedAt === null ||
    dayjs().isBefore(chapter.publishedAt, "hour");
  const isChapterBought = chapter.price === 0 || chapter.chapterMarketHistories;
  const onEditHandler = (e: MouseEvent) => {
    e.stopPropagation();
    void router.push({
      pathname: "/create/chapter",
      query: { chapterId: chapter.id },
    });
  };
  const originalIndex = findChapter(chapter.id).index;

  const [{ isDragging }, drag, preview] = useDrag(
    {
      type: "chapter",
      item: { id: chapter.id, originalIndex },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      end: (item, monitor) => {
        const { id: droppedId, originalIndex } = item;
        if (!monitor.didDrop()) {
          moveChapter(droppedId, originalIndex);
        }
      },
      canDrag: chapterNo > 0 && isEdit,
    },
    [chapter.id, originalIndex, moveChapter, isEdit]
  );
  const [, drop] = useDrop(
    () => ({
      accept: "chapter",
      hover({ id: draggedId }: { id: string; originalIndex: number }) {
        if (draggedId !== chapter.id) {
          const { index: overIndex } = findChapter(chapter.id);
          moveChapter(draggedId, overIndex);
        }
      },
    }),
    [findChapter, moveChapter]
  );

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  const clickCardHandler = () => {
    if (editable) return;
    if (!isOwner && !isChapterBought) {
      setOpenBuyChapter(true);
    } else {
      void router.push(`/chapter/${chapter.id}`);
    }
    return;
  };

  return (
    <div
      onClick={clickCardHandler}
      className={twJoin(
        "relative z-10 h-fit w-full",
        !editable &&
        "transition duration-100 ease-in-out hover:-translate-y-1 hover:scale-[1.01]",
        isDragging ? "opacity-0" : "opacity-100",
        isEdit ? "cursor-move" : "cursor-default"
      )}
    >
      {isOwner && chapter.price > 0 && (
        <div className="absolute -right-0 -top-1 z-20 flex items-center gap-1 rounded-full bg-gray-200 px-1">
          <Image
            src="/authorie_coin_logo.svg"
            alt="Authorie coin logo"
            width={30}
            height={30}
            className="h-3 w-3"
          />
          <p className="text-xs text-authYellow-500">{chapter.price}</p>
        </div>
      )}
      {chapter.publishedAt &&
        dayjs().isBefore(dayjs(chapter.publishedAt).add(1, "day")) && (
          <div className="absolute -left-3 -top-1 z-20 bg-red-400 px-1 font-semibold">
            <p className="text-xs text-white">New</p>
          </div>
        )}
      <DialogBuyChapter
        title={chapter.title}
        price={chapter.price}
        chapterId={chapter.id}
        isOpen={openBuyChapter}
        closeModal={() => setOpenBuyChapter(false)}
      />
      <div
        ref={(node) => drag(drop(node))}
        className="relative flex h-16 w-full cursor-pointer items-center justify-between overflow-hidden rounded-lg bg-white px-3 shadow-lg"
      >
        {chapter.price > 0 &&
          (status !== "authenticated" || (!isOwner && !isChapterBought)) && (
            <div className="absolute left-0 top-0 h-full w-full bg-black/70">
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
          )}
        <p className="w-[90px] text-2xl font-bold text-authGreen-600">
          #{chapterNo}
        </p>
        <div className="flex w-full flex-col gap-1">
          <h2 className="line-clamp-1 text-lg font-semibold">
            {chapter.title}
          </h2>
          {chapter.publishedAt &&
            (dayjs().isBefore(chapter.publishedAt) ? (
              <p className="text-xs font-semibold text-green-500">
                publish soon : {dayjs(chapter.publishedAt).format("DD/MM/YYYY hh:MM")}
              </p>
            ) : (
              <DateLabel
                date={chapter.publishedAt}
                withTime={true}
                publishedLabel
                font={"font-light"}
                size={"xs"}
              />
            ))}
        </div>
        <div className="flex h-full flex-col items-end justify-end gap-1 py-2">
          {editable && (
            <HiPencil
              onClick={onEditHandler}
              className="h-8 w-8 rounded-xl border p-1 hover:bg-gray-200"
            />
          )}
          <div className="flex gap-2">
            <div className="flex items-center gap-1 text-red-400">
              <HiHeart className="h-3 w-3" />
              <p className="text-xs font-semibold">{chapter._count.likes}</p>
            </div>
            <div className="flex items-center gap-1 text-authGreen-600">
              <HiEye className="h-3 w-3" />
              <p className="text-xs font-semibold">{chapter._count.views}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChapterCard;
