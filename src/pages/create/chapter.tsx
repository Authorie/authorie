import BookComboBox from "@components/Create/Chapter/BookComboBox";
import TextEditor from "@components/Create/Chapter/TextEditor";
import { PhotoIcon } from "@heroicons/react/24/outline";
import type { JSONContent } from "@tiptap/react";
import type { RouterOutputs } from "@utils/api";
import { api } from "@utils/api";
import { useSession } from "next-auth/react";
import { useState } from "react";

type Books = RouterOutputs["book"]["getAll"]["items"];

const CreateChapter = () => {
  const { status } = useSession();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState<JSONContent>();
  const [book, setBook] = useState<Books[number]>();
  const { data: user } = api.user.getData.useQuery(undefined, {
    enabled: status === "authenticated",
  });
  const createChapterMutation = api.chapter.create.useMutation();
  const onPublishHandler = () => {
    if (title !== "" && content && book) {
      createChapterMutation.mutate({
        title,
        content,
        bookId: book.id,
      });
    }
  };

  return (
    <div className="flex gap-4 rounded-b-2xl bg-white px-3 py-5">
      <div className="flex w-1/4 flex-col gap-3 rounded-lg bg-gray-100 p-4 shadow-lg">
        <h1 className="text-xl font-bold">Chapter drafts</h1>
        <p className="text-xs">
          Select one of previous chapter drafts, or you can create a new one.
        </p>
        {/* {DraftChapter.map((chapter) => (
          <ChapterDraftCard
            key={chapter.id}
            id={chapter.id}
            title={chapter.title}
          />
        ))} */}
      </div>
      <div className="w-3/4 overflow-hidden rounded-lg bg-gray-100 shadow-lg">
        <div className="flex flex-col bg-gray-200 px-4 py-3">
          <PhotoIcon className="h-6 w-6" />
          <input
            placeholder="Untitled"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="my-2 bg-transparent text-2xl font-semibold placeholder-gray-400 outline-none focus:outline-none"
          />
          <div className="mb-2 flex items-center">
            <span className="mr-4 text-xs text-gray-600">Author: </span>
            {user && <span className="text-xs">{user.penname}</span>}
          </div>
          {user && (
            <div className="flex items-center">
              <span className="mr-4 text-xs text-gray-600">Book: </span>
              <BookComboBox
                user={user}
                selectedBook={book}
                onSelectBook={(book: Books[number]) => setBook(book)}
              />
            </div>
          )}
        </div>
        <div className="h-full bg-white px-8 py-6">
          <TextEditor onEditorUpdate={setContent} />
          <div className="flex justify-between">
            <button className="h-6 w-24 rounded-lg bg-red-500 text-sm text-white">
              Delete
            </button>
            <div className="flex gap-3">
              <button className="h-6 w-24 rounded-lg bg-authBlue-500 text-sm text-white">
                Save
              </button>
              <button
                className="h-6 w-24 rounded-lg bg-authGreen-600 text-sm font-semibold text-white"
                onClick={onPublishHandler}
              >
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
