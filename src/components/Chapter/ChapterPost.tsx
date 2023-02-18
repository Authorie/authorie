type props = {
  bookTitle: string;
  chapterNumber: number;
  chapterTitle: string;
  publishDate: Date;
  content: string;
};

const ChapterPost = ({
  bookTitle,
  chapterNumber,
  chapterTitle,
  publishDate,
  content,
}: props) => {
  return (
    <div className="flex w-full flex-col gap-3 rounded-xl bg-white p-3 shadow-md">
      <div className="flex flex-col gap-1 rounded-t-xl bg-gradient-to-l from-amber-400 px-16 pb-5 pt-8">
        <h1 className="text-3xl font-bold">{bookTitle}</h1>
        <h3 className="text-2xl font-bold text-black">
          <span className="text-dark-400">chapter {chapterNumber}</span> :{" "}
          {chapterTitle}
        </h3>
        <p className="text-xs text-dark-400">
          publish: {publishDate.toDateString()}
        </p>
      </div>
      <div className="px-16">{content}</div>
    </div>
  );
};

export default ChapterPost;
