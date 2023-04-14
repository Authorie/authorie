import type { XYCoord } from "react-dnd";
import { useDragLayer } from "react-dnd";
import type { RouterOutputs } from "~/utils/api";
import ChapterCard from "./ChapterCard";

function getItemStyles(
  initialOffset: XYCoord | null,
  currentOffset: XYCoord | null
) {
  if (!initialOffset || !currentOffset) {
    return {
      display: "none",
    };
  }

  const { x, y } = currentOffset;

  const transform = `translate(${x}px, ${y}px)`;
  return {
    transform,
    WebkitTransform: transform,
  };
}

type props = {
  chapters: Array<RouterOutputs["book"]["getData"]["chapters"][number]>;
  moveChapter: (id: string, atIndex: number) => void;
  findChapter: (id: string) => {
    card?: RouterOutputs["book"]["getData"]["chapters"][number];
    index: number;
  };
};

const ChapterDragLayer = ({ moveChapter, findChapter, chapters }: props) => {
  const { itemType, isDragging, item, initialOffset, currentOffset } =
    useDragLayer((monitor) => ({
      item: monitor.getItem<{ id: string; originalIndex: number }>(),
      itemType: monitor.getItemType(),
      initialOffset: monitor.getInitialSourceClientOffset(),
      currentOffset: monitor.getSourceClientOffset(),
      isDragging: monitor.isDragging(),
    }));

  if (!isDragging) {
    return null;
  }

  return (
    <div className=" fixed left-0 top-0 z-0 h-full w-full">
      <div
        style={getItemStyles(initialOffset, currentOffset)}
        className={` h-fit w-96`}
      >
        {itemType === "chapter" && (
          <ChapterCard
            key={item.id}
            chapterNo={chapters.length - findChapter(item.id).index}
            isEdit={false}
            chapter={
              chapters[
              findChapter(item.id).index
              ] as RouterOutputs["book"]["getData"]["chapters"][number]
            }
            moveChapter={moveChapter}
            findChapter={findChapter}
          />
        )}
      </div>
    </div>
  );
};

export default ChapterDragLayer;
