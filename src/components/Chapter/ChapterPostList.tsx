import { mockChapters } from "mocks";
import ChapterPost from "./ChapterPost";

const ChapterPostList = () => {
  return (
    <div className="flex flex-col gap-8">
      {mockChapters.map((chapter) => (
        <ChapterPost
          key={`${chapter.bookTitle}_${chapter.chapterNumber}_${chapter.chapterTitle}`}
          {...chapter}
        />
      ))}
    </div>
  );
};

export default ChapterPostList;
