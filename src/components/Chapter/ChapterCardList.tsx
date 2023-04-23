import update from "immutability-helper";
import { useRouter } from "next/router";
import { useCallback } from "react";
import { useDrop } from "react-dnd";
import { HiPlusCircle } from "react-icons/hi2";
import { type RouterOutputs } from "~/utils/api";
import ChapterCard from "./ChapterCard";
import ChapterDragLayer from "./ChapterDragLayer";

type props = {
  isEdit: boolean;
  isChapterCreatable: boolean;
  arrangedChapters: RouterOutputs["book"]["getData"]["chapters"];
  setArrangedChapters: React.Dispatch<React.SetStateAction<RouterOutputs["book"]["getData"]["chapters"]>>;
};

const ChapterCardList = ({ arrangedChapters, setArrangedChapters, isEdit, isChapterCreatable }: props) => {
  const router = useRouter();
  const numberOfDraftChapters = arrangedChapters.reduceRight((acc, chapter) => {
    if (chapter.publishedAt) return acc;
    return acc + 1;
  }, 0)

  const findChapter = useCallback(
    (id: string) => {
      const chapterIndex = arrangedChapters.findIndex(
        (chapter) => chapter.id === id
      );
      if (chapterIndex < 0) return { index: chapterIndex };
      return {
        chapter: arrangedChapters[chapterIndex],
        index: chapterIndex,
      };
    },
    [arrangedChapters]
  );

  const moveChapter = useCallback((id: string, atIndex: number) => {
    setArrangedChapters((arrangedChapters) => {
      const chapterIndex = arrangedChapters.findIndex(
        (chapter) => chapter.id === id
      );
      if (chapterIndex < 0) return arrangedChapters;
      const chapter = arrangedChapters[chapterIndex];
      if (chapter == undefined) return arrangedChapters;
      return update(arrangedChapters, {
        $splice: [
          [chapterIndex, 1],
          [atIndex, 0, chapter],
        ],
      });
    });
  }, [setArrangedChapters]);

  const [, drop] = useDrop(() => ({ accept: "chapter" }));

  return (
    <div className="min-h-[400px] rounded-sm bg-authGreen-300 shadow-lg">
      <div ref={drop} className="grid grid-cols-2 gap-x-4 gap-y-2 p-4">
        {isChapterCreatable && (
          <div
            onClick={() => void router.push("/create/chapter")}
            className="flex h-16 w-full cursor-pointer items-center justify-center gap-4 rounded-lg bg-white p-3 shadow-lg transition duration-100 ease-in-out hover:-translate-y-1 hover:scale-[1.01] hover:bg-gray-200"
          >
            <HiPlusCircle className="h-6 w-6" />
            <span className="text-lg font-semibold">Create new chapter</span>
          </div>
        )}
        {arrangedChapters.length === 0 && !isChapterCreatable && (
          <div className="flex h-16 w-full cursor-pointer items-center justify-center rounded-lg bg-white p-3 shadow-lg">
            <span className="text-lg font-semibold">
              This book has no chapters yet
            </span>
          </div>
        )}
        {arrangedChapters.map((chapter, index) => (
          <ChapterCard
            key={chapter.id}
            chapterNo={isEdit && chapter.chapterNo ? arrangedChapters.length - numberOfDraftChapters - index : chapter.chapterNo ?? 0}
            isEdit={isEdit}
            chapter={chapter}
            moveChapter={moveChapter}
            findChapter={findChapter}
          />
        ))}
      </div>
      <ChapterDragLayer
        moveChapter={moveChapter}
        findChapter={findChapter}
        chapters={arrangedChapters}
      />
    </div>
  );
};

export default ChapterCardList;
