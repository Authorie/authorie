import { EyeIcon, HeartIcon, PencilIcon } from "@heroicons/react/24/solid";
import type { RouterOutputs } from "@utils/api";
import { useDrag, useDrop } from "react-dnd";
import React, { useEffect } from "react";
import { getEmptyImage } from "react-dnd-html5-backend";

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
  const originalIndex = findChapter(chapter.id).index;

  const id = chapter.id;

  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type: "chapter",
      item: { id, originalIndex },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      end: (item, monitor) => {
        const { id: droppedId, originalIndex } = item;
        const didDrop = monitor.didDrop();

        if (!didDrop) {
          moveChapter(droppedId, originalIndex);
        }
      },
      canDrag: isEdit,
    }),
    [id, originalIndex, moveChapter, isEdit]
  );

  const [, drop] = useDrop(
    () => ({
      accept: "chapter",
      hover({ id: draggedId }: { id: string; originalIndex: number }) {
        if (draggedId !== id) {
          const { index: overIndex } = findChapter(id);
          moveChapter(draggedId, overIndex);
        }
      },
    }),
    [findChapter, moveChapter]
  );

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  return (
    <div
      key={id}
      ref={(node) => drag(drop(node))}
      className={`z-10 flex h-16 w-full cursor-pointer items-center justify-between rounded-lg bg-white 
      p-3 shadow-lg transition duration-100 ease-in-out hover:-translate-y-1 hover:scale-[1.01]
      ${isDragging ? "opacity-0" : "opacity-100"} ${
        isEdit ? "cursor-move" : "cursor-default"
      }`}
    >
      <h1 className="text-3xl font-bold text-authGreen-600"># {chapterNo}</h1>
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">{chapter.title}</h2>
        {chapter.publishedAt && (
          <p className="text-xs font-extralight">{`Last update : ${chapter.publishedAt.toLocaleDateString(
            "en-US"
          )}`}</p>
        )}
      </div>
      <div className="flex flex-col items-end gap-1">
        <PencilIcon className="h-8 w-8 rounded-xl border p-2" />
        <div className="flex gap-2">
          <div className="flex items-center gap-1 text-red-400">
            <HeartIcon className="h-3 w-3" />
            <p className="text-xs font-semibold">{chapter._count.likes}</p>
          </div>
          <div className="flex items-center gap-1 text-authGreen-600">
            <EyeIcon className="h-3 w-3" />
            <p className="text-xs font-semibold">{chapter.views}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChapterCard;
