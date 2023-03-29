import type { Chapter } from "@prisma/client";
import update from "immutability-helper";
import type { Dispatch, SetStateAction } from "react";
import { useCallback } from "react";
import ChapterCard from "./ChapterCard";

const ChapterContainer = ({
  chapters,
  setChapters,
}: {
  chapters: Array<Chapter>;
  setChapters: Dispatch<SetStateAction<Chapter[]>>;
}) => {
  const findChapter = useCallback(
    (id: string) => {
      const card = chapters.filter((c) => `${c.id}` === id)[0] as Chapter;
      return {
        card,
        index: chapters.indexOf(card),
      };
    },
    [chapters]
  );

  const moveItem = useCallback(
    (id: string, atIndex: number) => {
      const { card, index } = findChapter(id);
      setChapters(
        update(chapters, {
          $splice: [
            [index, 1],
            [atIndex, 0, card],
          ],
        })
      );
    },
    [findChapter, chapters, setChapters]
  );

  return (
    <div className="flex h-52 w-52 flex-col bg-slate-300 px-4">
      {chapters.map((chapter) => (
        <ChapterCard
          key={chapter.id}
          chapter={chapter}
          moveItem={moveItem}
          findItem={findItem}
        />
      ))}
    </div>
  );
};

export default ChapterContainer;
