import { type Book, type Chapter } from "@prisma/client";
import type { JSONContent } from "@tiptap/react";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { default as Image, default as NextImage } from "next/image";
import { useRouter } from "next/router";
import type { ChangeEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import BookComboBox from "~/components/Create/Chapter/BookComboBox";
import DraftChapterBoard from "~/components/Create/Chapter/DraftChapterBoard";
import { useEditor } from "~/hooks/editor";
import { api } from "~/utils/api";
const CreateChapterBoard = dynamic(
  () => import("~/components/Create/Chapter/CreateChapterBoard")
);

const CreateChapter = () => {
  const router = useRouter();
  useSession({
    required: true,
    onUnauthenticated() {
      void router.push("/auth/login")
    }
  })
  const [priceError, setPriceError] = useState("");
  const [errors, setErrors] = useState<{ title: string | undefined }>({
    title: undefined,
  });
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState<number>();
  const [book, setBook] = useState<Book | null>(null);
  const [chapter, setChapter] = useState<
    (Chapter & { book: Book | null }) | null
  >(null);
  const editor = useEditor("", true);
  const { data: user } = api.user.getData.useQuery(undefined);
  const { data: draftChapters } = api.chapter.getDrafts.useQuery(undefined);
  const filteredDrafts = useMemo(() => {
    return draftChapters?.filter(
      (draft) =>
        !draft.publishedAt || dayjs().add(1, "hour").isBefore(draft.publishedAt)
    );
  }, [draftChapters]);

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

  const changePriceHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.trim();

    if (input === "") {
      setPriceError("");
      setPrice(undefined);
    } else {
      const parsed = parseInt(input);

      if (isNaN(parsed) || parsed < 0 || parsed.toString() !== input) {
        setPriceError("Please enter a positive integer.");
        setPrice(undefined);
      } else {
        setPriceError("");
        setPrice(parsed);
      }
    }
  };

  useEffect(() => {
    const chapterId = router.query.chapterId as string | undefined;
    if (chapterId) {
      const chapter = filteredDrafts?.find(
        (chapter) => chapter.id === chapterId
      );
      if (chapter) selectDraftHandler(chapter);
      else void router.push("/create/chapter");
    }
  }, [router, filteredDrafts, selectDraftHandler]);

  return (
    <div className="flex-0 flex h-full gap-4 rounded-b-2xl bg-white px-4 py-5">
      <DraftChapterBoard
        draftChapters={filteredDrafts}
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
                          ${title && title.length > 80
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
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-600">Book: </span>
                  <BookComboBox
                    user={user}
                    selectedBook={book}
                    onToggleBook={toggleBookHandler}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Price: </span>
                  <input
                    className="selection: h-5 w-16 rounded-lg pl-3 pr-5 text-xs shadow-md outline-none focus:outline-none"
                    placeholder="0"
                    onChange={changePriceHandler}
                  />
                  <Image
                    src="/authorie_coin_logo.svg"
                    alt="Authorie coin logo"
                    width={30}
                    height={30}
                    className="h-5 w-5"
                  />
                  {priceError && (
                    <p className="text-xs text-red-500">{priceError}</p>
                  )}
                </div>
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
            price={price}
            selectDraftHandler={selectDraftHandler}
          />
        )}
      </div>
    </div>
  );
};

export default CreateChapter;
