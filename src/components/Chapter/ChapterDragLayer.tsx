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
  bookId: string;
  chapters: Array<RouterOutputs["book"]["getData"]["chapters"][number]>;
  moveChapter: (id: string, atIndex: number) => void;
  findChapter: (id: string) => {
    card?: RouterOutputs["book"]["getData"]["chapters"][number];
    index: number;
  };
};

const ChapterDragLayer = ({
  moveChapter,
  findChapter,
  chapters,
  bookId,
}: props) => {
  const { itemType, isDragging, item, initialOffset, currentOffset } =
    useDragLayer((monitor) => ({
      item: monitor.getItem<{ id: string; originalIndex: number }>(),
      itemType: monitor.getItemType(),
      initialOffset: monitor.getInitialSourceClientOffset(),
      currentOffset: monitor.getSourceClientOffset(),
      isDragging: monitor.isDragging(),
    }));
  const itemIndex = item ? findChapter(item.id).index : 0;
  const numberOfDraftChapters = chapters.reduceRight((acc, chapter) => {
    if (chapter.publishedAt) return acc;
    return acc + 1;
  }, 0);

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
            bookId={bookId}
            chapterNo={chapters.length - numberOfDraftChapters - itemIndex}
            isEdit={false}
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            chapter={chapters[itemIndex]!}
            moveChapter={moveChapter}
            findChapter={findChapter}
          />
        )}
      </div>
    </div>
  );
};

export default ChapterDragLayer;
