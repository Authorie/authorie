import type { JSONContent } from "@tiptap/react";
import { signIn, useSession } from "next-auth/react";
import { default as Image, default as NextImage } from "next/image";
import { useRouter } from "next/router";
import { type ChangeEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import TextareaAutoSize from "react-textarea-autosize";
import BookComboBox from "~/components/Create/Chapter/BookComboBox";
import CreateChapterBoard from "~/components/Create/Chapter/CreateChapterBoard";
import DraftChapterBoard from "~/components/Create/Chapter/DraftChapterBoard";
import { useEditor } from "~/hooks/editor";
import { type RouterOutputs, api } from "~/utils/api";

const CreateChapter = () => {
  const router = useRouter();
  useSession({
    required: true,
    onUnauthenticated() {
      void signIn();
    },
  });
  const bookId = router.query.bookId as string | undefined;
  const [priceError, setPriceError] = useState("");
  const [errors, setErrors] = useState<{ title: string | undefined }>({
    title: undefined,
  });
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState<number>();
  const [book, setBook] = useState<
    | RouterOutputs["book"]["getData"]
    | RouterOutputs["chapter"]["getData"]["book"]
    | null
  >(null);
  const [chapter, setChapter] = useState<
    RouterOutputs["chapter"]["getData"] | null
  >(null);

  const editor = useEditor("", true);
  const { data: user } = api.user.getData.useQuery(undefined);
  const { data: draftChapterIds } = api.chapter.getDrafts.useQuery(undefined);
  const draftChapters = api.useQueries(
    (t) => draftChapterIds?.map((id) => t.chapter.getData(id)) ?? []
  );
  const draftChaptersLoading = draftChapters.some((q) => q.isLoading);
  api.book.getData.useQuery(
    { id: bookId! },
    {
      enabled: router.isReady && !!bookId,
      onSuccess(data) {
        if (data.isOwner) {
          setBook(data);
        }
      },
    }
  );

  const selectDraftHandler = useCallback(
    (chapter: RouterOutputs["chapter"]["getData"] | null) => {
      if (!editor) return;
      setErrors({
        title: undefined,
      });
      setChapter(chapter);
      setTitle(chapter?.title ?? "");
      editor.commands.setContent(
        chapter ? (chapter.content as JSONContent) : ""
      );
      setBook(chapter ? chapter.book : null);
    },
    [editor]
  );
  const toggleBookHandler = (
    book:
      | RouterOutputs["book"]["getData"]
      | RouterOutputs["chapter"]["getData"]["book"]
  ) => {
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

  const changeTitleHandler = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target.value.trim();
    if (input.length > 80) {
      setErrors({ title: "The title is too long" });
    }
    if (input.length <= 80) {
      setErrors({ title: "" });
    }
    setTitle(e.target.value);
  };

  useEffect(() => {
    const chapterId = router.query.chapterId as string | undefined;
    if (chapterId && chapter && chapter.id === chapterId) return;
    if (chapterId && !draftChaptersLoading) {
      const chapter = draftChapters.find(
        ({ data: chapter }) => chapter?.id === chapterId
      );
      if (chapter && chapter.data) selectDraftHandler(chapter.data);
    }
  }, [
    router,
    selectDraftHandler,
    draftChaptersLoading,
    draftChapters,
    chapter,
  ]);

  return (
    <div className="flex-0 flex h-full gap-4 rounded-b-2xl bg-white px-4 py-5">
      <DraftChapterBoard
        draftChapters={draftChapters.map(({ data }) => data)}
        selectedChapterId={chapter?.id}
        selectDraftHandler={selectDraftHandler}
      />
      <div className="flex grow flex-col overflow-y-auto rounded-lg bg-gray-100 shadow-xl drop-shadow-2xl">
        <div className="relative flex flex-col bg-gray-200 px-4 py-3">
          <div className="absolute inset-0 cursor-pointer overflow-hidden">
            {book && book.wallpaperImage && (
              <NextImage
                src={book.wallpaperImage}
                alt="chapter's cover"
                width={1000}
                height={200}
              />
            )}
          </div>
          <div className="z-20 flex flex-col gap-2 rounded-lg bg-gray-200/50 p-2 backdrop-blur">
            <div className="flex items-end gap-2">
              <TextareaAutoSize
                minRows={1}
                placeholder="Untitled"
                className="w-full resize-none bg-transparent text-2xl font-semibold placeholder-gray-400 outline-none focus:outline-none"
                value={title}
                onChange={changeTitleHandler}
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
            book={book}
            title={title}
            editor={editor}
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
