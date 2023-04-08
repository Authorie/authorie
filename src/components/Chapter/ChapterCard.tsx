import dayjs from "dayjs";
import { useRouter } from "next/router";
import type { MouseEvent } from "react";
import { useEffect, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import { HiEye, HiHeart, HiPencil, HiLockClosed } from "react-icons/hi2";
import type { RouterOutputs } from "~/utils/api";
import Image from "next/image";
import DialogLayout from "../Dialog/DialogLayout";

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
      canDrag: isEdit,
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
    //also check if buy yet
    if (chapter.price) {
      setOpenBuyChapter(true);
    } else {
      confirmHandler();
    }
  };

  const confirmHandler = () => {
    void router.push(`/chapter/${chapter.id}`);
  };

  return (
    <div
      ref={(node) => drag(drop(node))}
      onClick={clickCardHandler}
      className={`relative z-10 flex h-16 w-full cursor-pointer items-center justify-between overflow-hidden rounded-lg 
      bg-white px-3 shadow-lg transition duration-100 ease-in-out hover:-translate-y-1 hover:scale-[1.01]
      ${isDragging ? "opacity-0" : "opacity-100"} ${
        isEdit ? "cursor-move" : "cursor-default"
      }`}
    >
      {chapter.price && (
        <>
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
          <DialogLayout
            isOpen={openBuyChapter}
            closeModal={() => setOpenBuyChapter(false)}
            title="Buy chapter"
            description={`Do you want to buy the chapter called "${chapter.title}"`}
            button
            onClick={() => confirmHandler()}
          />
        </>
      )}
      <h1 className="mr-3 w-20 text-3xl font-bold text-authGreen-600">
        # {chapterNo}
      </h1>
      <div className="flex w-full flex-col gap-1">
        <h2 className="line-clamp-1 text-lg font-semibold">{chapter.title}</h2>
        {chapter.publishedAt &&
          (chapter.publishedAt > new Date() ? (
            <p className="text-xs font-semibold text-green-500">
              publish soon on: {chapter.publishedAt.toLocaleDateString()}
              {", "}
              {chapter.publishedAt.toLocaleTimeString()}
            </p>
          ) : (
            <p className="text-xs font-extralight">{`publish at : ${chapter.publishedAt.toLocaleDateString(
              "en-US"
            )}`}</p>
          ))}
      </div>
      <div className="flex h-full flex-col items-end justify-end gap-1 py-2">
        {(chapter.publishedAt === null ||
          dayjs().subtract(1, "hour").isBefore(chapter.publishedAt)) && (
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
  );
};

export default ChapterCard;
