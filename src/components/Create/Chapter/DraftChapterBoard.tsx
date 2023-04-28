import { useAutoAnimate } from "@formkit/auto-animate/react";
import type { RouterOutputs } from "~/utils/api";
import ChapterDraftCard from "./ChapterDraftCard";

type props = {
  draftChapters: (RouterOutputs["chapter"]["getData"] | undefined)[];
  selectedChapterId: string | undefined;
  selectDraftHandler: (
    chapter: RouterOutputs["chapter"]["getData"] | null
  ) => void;
};

const DraftChapterBoard = ({
  draftChapters,
  selectedChapterId,
  selectDraftHandler,
}: props) => {
  const [animationParent] = useAutoAnimate({
    duration: 300,
  });
  return (
    <div className="flex basis-1/4 flex-col gap-3 rounded-lg bg-gray-200 p-4 shadow-xl drop-shadow">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-bold">Draft Chapters</h1>
        <p className="text-xs">
          Select one of previous drafts, or you can create a new one.
        </p>
      </div>
      <ul className="grid grid-flow-row gap-3">
        <ChapterDraftCard
          title="Create a new chapter"
          selected={selectedChapterId === undefined}
          onClickHandler={() => selectDraftHandler(null)}
        />
        <div ref={animationParent} className="grid grid-flow-row gap-3">
          {draftChapters.map((draftChapter) =>
            draftChapter ? (
              <ChapterDraftCard
                key={draftChapter.id}
                title={draftChapter.title}
                selected={draftChapter.id === selectedChapterId}
                onClickHandler={() => selectDraftHandler(draftChapter)}
                publishedAt={draftChapter.publishedAt}
              />
            ) : null
          )}
        </div>
      </ul>
    </div>
  );
};

export default DraftChapterBoard;
