import BookComboBox from "@components/Create/Chapter/BookComboBox";
import ChapterDraftCard from "@components/Create/Chapter/ChapterDraftCard";
import TextEditor from "@components/Create/Chapter/TextEditor";
import { PhotoIcon } from "@heroicons/react/24/outline";

const DraftChapter = [
  { id: "1234", title: "chapter 1" },
  { id: "12345", title: "chapter 2" },
];

const CreateChapter = () => {
  return (
    <div className="flex gap-4 rounded-b-2xl bg-white px-3 py-5">
      <div className="flex w-1/4 flex-col gap-3 rounded-lg bg-gray-100 p-4 shadow-lg">
        <h1 className="text-xl font-bold">Chapter drafts</h1>
        <p className="text-xs">
          Select one of previous chapter drafts, or you can create a new one.
        </p>
        {DraftChapter.map((chapter) => (
          <ChapterDraftCard
            key={chapter.id}
            id={chapter.id}
            title={chapter.title}
          />
        ))}
      </div>
      <div className="w-3/4 overflow-hidden rounded-lg bg-gray-100 shadow-lg">
        <div className="flex flex-col bg-gray-200 px-4 py-3">
          <PhotoIcon className="h-6 w-6" />
          <input
            placeholder="Untitled"
            className="my-2 bg-transparent text-2xl font-semibold placeholder-gray-400 outline-none focus:outline-none"
          />
          <div className="mb-2 flex items-center">
            <span className="mr-4 text-xs text-gray-600">Author: </span>
            <span className="text-xs">author name</span>
          </div>
          <div className="flex items-center">
            <span className="mr-4 text-xs text-gray-600">Book: </span>
            <BookComboBox />
          </div>
        </div>
        <div className="h-full bg-white px-8 py-6">
          <TextEditor />
          <div className="flex justify-between">
            <button className="h-6 w-24 rounded-lg bg-red-500 text-sm text-white">
              Delete
            </button>
            <div className="flex gap-3">
              <button className="h-6 w-24 rounded-lg bg-authBlue-500 text-sm text-white">
                Save
              </button>
              <button className="h-6 w-24 rounded-lg bg-authGreen-600 text-sm font-semibold text-white">
                Publish
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateChapter;
