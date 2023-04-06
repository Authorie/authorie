import { type Book, type Chapter } from "@prisma/client";
import type { JSONContent } from "@tiptap/react";
import dynamic from "next/dynamic";
import NextImage from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState, useCallback } from "react";
import BookComboBox from "~/components/Create/Chapter/BookComboBox";
import DraftChapterBoard from "~/components/Create/Chapter/DraftChapterBoard";
import { useEditor } from "~/hooks/editor";
import { api } from "~/utils/api";
const CreateChapterBoard = dynamic(
  () => import("~/components/Create/Chapter/CreateChapterBoard")
);

const CreateChapter = () => {
  const router = useRouter();
  const [errors, setErrors] = useState<{ title: string | undefined }>({
    title: undefined,
  });
  const editChapterSelected = router.query.chapterId;
  const { data: selectedChapter, refetch } = api.chapter.getData.useQuery({
    id: editChapterSelected ? (editChapterSelected as string) : "",
  });
  const [title, setTitle] = useState("");
  const [book, setBook] = useState<Book | null>(null);
  const [chapter, setChapter] = useState<
    (Chapter & { book: Book | null }) | null
  >(null);
  const editor = useEditor("");

  const { data: user } = api.user.getData.useQuery(undefined);
  const { data: draftChapters } = api.chapter.getDrafts.useQuery(undefined);

  const selectDraftHandler = useCallback(
    (chapter: (Chapter & { book: Book | null }) | null) => {
      if (!editor) return;
      setErrors({
        title: undefined,
      });
      setChapter(chapter);
      setTitle(chapter?.title || "");
      editor.commands.setContent(
        chapter ? (chapter.content as JSONContent) : ""
      );
      setBook(chapter ? chapter.book : null);
    },
    [editor]
  );
  const toggleBookHandler = (book: Book) => {
    setBook((prev) => {
      if (prev === book) {
        return null;
      }
      return book;
    });
  };

  useEffect(() => {
    if (selectedChapter) {
      const schapter = draftChapters?.find(
        (data) => data.id === selectedChapter.id
      );
      if (!schapter) return;
      selectDraftHandler(schapter);
    }
  }, [selectDraftHandler, draftChapters, selectedChapter]);

  return (
    <div className="flex-0 flex h-full gap-4 rounded-b-2xl bg-white px-4 py-5">
      <DraftChapterBoard
        draftChapters={draftChapters}
        selectedChapterId={chapter?.id}
        selectDraftHandler={selectDraftHandler}
      />
      <div className="flex grow flex-col overflow-y-auto rounded-lg bg-gray-100 shadow-xl drop-shadow">
        <div className="relative flex flex-col bg-gray-200 px-4 py-3">
          <div className="absolute inset-0 cursor-pointer">
            {book && book.wallpaperImage && (
              <NextImage src={book.wallpaperImage} alt="chapter's cover" fill />
            )}
          </div>
          <div className="z-20 flex flex-col gap-2 rounded-lg bg-gray-200/50 p-2 backdrop-blur">
            <div className="flex items-end gap-2">
              <input
                placeholder="Untitled"
                className="w-full bg-transparent text-2xl font-semibold placeholder-gray-600 outline-none focus:outline-none"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <p
                className={`${"text-xs"} 
                          ${
                            title && title.length > 80
                              ? "text-red-500"
                              : "text-black"
                          }`}
              >
                {title ? title.length : 0}
                /80
              </p>
            </div>
            {errors.title && (
              <p className="text-xs text-red-400" role="alert">
                {errors.title}
              </p>
            )}
            <div className="flex w-fit items-center gap-4">
              <span className="text-xs text-gray-600">Author </span>
              {user && (
                <span className="text-xs font-semibold">{user.penname}</span>
              )}
            </div>
            {user && (
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-600">Book </span>
                <BookComboBox
                  user={user}
                  selectedBook={book}
                  onToggleBook={toggleBookHandler}
                />
              </div>
            )}
          </div>
        </div>
        {editor && (
          <CreateChapterBoard
            editor={editor}
            title={title}
            bookId={book?.id}
            selectedChapter={chapter}
            setErrors={setErrors}
          />
        )}
      </div>
    </div>
  );
};

export default CreateChapter;
