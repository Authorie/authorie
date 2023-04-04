import BookComboBox from "@components/Create/Chapter/BookComboBox";
import ChapterDraftCard from "@components/Create/Chapter/ChapterDraftCard";
import { Heading } from "@components/Create/Chapter/TextEditorMenu/Heading";
import TextEditorMenuBar from "@components/Create/Chapter/TextEditorMenu/TextEditorMenuBar";
import DateTimeInputField from "@components/DateTimeInput/DateTimeInputField";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Popover } from "@headlessui/react";
import { BookStatus, type Book, type Chapter } from "@prisma/client";
import { appRouter } from "@server/api/root";
import { createInnerTRPCContext } from "@server/api/trpc";
import { getServerAuthSession } from "@server/auth";
import CharacterCount from "@tiptap/extension-character-count";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TextStyle from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import type { JSONContent } from "@tiptap/react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { api } from "@utils/api";
import type { GetServerSidePropsContext } from "next";
import { useSession } from "next-auth/react";
import NextImage from "next/image";
import { useState } from "react";
import toast from "react-hot-toast";
import superjson from "superjson";
import z from "zod";

const validationSchema = z.object({
  title: z
    .string()
    .max(80, { message: "Your title is too long" })
    .min(1, { message: "Your title is required" }),
});

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getServerAuthSession(context);
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: createInnerTRPCContext({ session }),
    transformer: superjson,
  });

  if (session && session.user) {
    const promises = [
      ssg.user.getData.prefetch(),
      ssg.chapter.getDrafts.prefetch(),
      ssg.search.searchBooks.prefetch({
        search: {
          userId: session.user.id,
          status: [BookStatus.DRAFT, BookStatus.PUBLISHED],
        },
        limit: 5,
      }),
    ];
    await Promise.allSettled(promises);
  }

  return {
    props: {
      trpcState: ssg.dehydrate(),
      session,
    },
  };
};

const CreateChapter = () => {
  const { status } = useSession();
  const context = api.useContext();
  const [title, setTitle] = useState("");
  const [errors, setErrors] = useState<{ title: string | undefined }>({
    title: undefined,
  });
  const [animationParent] = useAutoAnimate();
  const [book, setBook] = useState<Book | null>(null);
  const [chapter, setChapter] = useState<
    (Chapter & { book: Book | null }) | null
  >(null);
  const editor = useEditor({
    content: "",
    extensions: [
      StarterKit.configure({
        heading: false,
        paragraph: {
          HTMLAttributes: {
            class: "text-[length:var(--editor-h2)]",
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: "list-disc px-4",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal px-4",
          },
        },
      }),
      Underline,
      Heading,
      Highlight,
      TextStyle,
      Color,
      Link.configure({
        HTMLAttributes: {
          class:
            "rounded shadow-md bg-white p-1 hover:underline hover:bg-slate-100 text-blue-500",
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class:
            "border-collapse m-0 select-all overflow-hidden w-full table-auto",
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: "select-all",
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class:
            "border-slate-500 border-2 border-solid bg-slate-200 relative text-left select-all",
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class:
            "border-slate-500 border-2 border-solid w-20 text-left select-all",
        },
      }),
      Image,
      CharacterCount,
    ],
    editorProps: {
      attributes: {
        class: "focus:outline-none px-4",
      },
    },
    autofocus: "start",
  });
  const { data: user } = api.user.getData.useQuery(undefined, {
    enabled: status === "authenticated",
  });
  const { data: draftChapters } = api.chapter.getDrafts.useQuery(undefined, {
    enabled: status === "authenticated",
  });
  const createChapterMutation = api.chapter.create.useMutation();
  const deleteChapterMutation = api.chapter.deleteDraft.useMutation();
  const validateInput = () => {
    const validationResult = validationSchema.safeParse({ title });
    return validationResult.success ? undefined : validationResult.error;
  };
  const deleteDraftChapterHandler = async () => {
    if (chapter) {
      const promise = deleteChapterMutation.mutateAsync(
        {
          id: chapter.id,
        },
        {
          async onSettled(data) {
            await context.chapter.getDrafts.invalidate();
            if (data) selectDraftHandler(undefined);
          },
        }
      );
      await toast.promise(promise, {
        loading: "Deleting...",
        success: "Deleted!",
        error: "Error deleting",
      });
    } else {
      toast.error("Chapter not saved yet");
    }
  };
  const saveDraftChapterHandler = async () => {
    if (!editor) return;
    const validationError = validateInput();
    if (validationError) {
      setErrors({
        title: validationError.formErrors.fieldErrors.title?.toString(),
      });
    } else {
      const promise = createChapterMutation.mutateAsync(
        {
          chapterId: chapter ? chapter.id : undefined,
          title,
          content: editor.getJSON(),
          bookId: book ? book.id : undefined,
          publishedAt: null,
        },
        {
          async onSettled(data) {
            await context.chapter.getDrafts.invalidate();
            if (data) selectDraftHandler(undefined, data);
          },
        }
      );
      await toast.promise(promise, {
        loading: "Saving...",
        success: "Saved!",
        error: "Error saving",
      });
    }
  };
  const publishDraftChapterHandler = async (date?: Date) => {
    if (!editor) return;
    const validationError = validateInput();
    if (!book) return;
    if (validationError) {
      setErrors({
        title: validationError.formErrors.fieldErrors.title?.toString(),
      });
    } else {
      const promise = createChapterMutation.mutateAsync(
        {
          chapterId: chapter ? chapter.id : undefined,
          title: title,
          content: editor.getJSON(),
          bookId: book ? book.id : undefined,
          publishedAt: date || true,
        },
        {
          async onSettled(data) {
            await context.chapter.getDrafts.invalidate();
            if (data) selectDraftHandler(undefined, data);
          },
        }
      );
      // void router.push(`/${user?.penname as string}/book /${book.id}`);
      await toast.promise(promise, {
        loading: "Publishing...",
        success: "Published!",
        error: "Error publishing",
      });
    }
  };
  const selectDraftHandler = (
    id: string | undefined,
    chapter?: Chapter & { book: Book | null }
  ) => {
    if (!editor) return;
    if (!chapter) chapter = draftChapters?.find((chapter) => chapter.id === id);
    if (chapter !== undefined) {
      setErrors({
        title: undefined,
      });
      setChapter(chapter);
      setTitle(chapter.title);
      editor.commands.setContent(chapter.content as JSONContent);
      setBook(chapter.book as Book);
      return;
    } else {
      setChapter(null);
      setTitle("");
      editor?.commands.setContent("");
      setBook(null);
    }
  };
  const toggleBookHandler = (book: Book) => {
    setBook((prev) => {
      if (prev === book) {
        return null;
      }
      return book;
    });
  };
  const editorFocusHandler = () => {
    if (!editor) return;
    editor.commands.focus();
  };

  return (
    <div className="flex-0 flex h-full gap-4 rounded-b-2xl bg-white px-4 py-5">
      <div className="flex basis-1/4 flex-col gap-3 rounded-lg bg-gray-200 p-4 shadow-xl drop-shadow">
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-bold">Draft Chapters</h1>
          <p className="text-xs">
            Select one of previous drafts, or you can create a new one.
          </p>
        </div>
        <ul ref={animationParent} className="flex flex-col gap-3">
          <ChapterDraftCard
            title="Create a new chapter"
            selected={chapter === null}
            onClickHandler={() => selectDraftHandler(undefined)}
          />
          {draftChapters &&
            draftChapters.map((draftChapter) => (
              <ChapterDraftCard
                key={draftChapter.id}
                title={draftChapter.title}
                selected={chapter ? chapter.id === draftChapter.id : false}
                onClickHandler={() => selectDraftHandler(draftChapter.id)}
              />
            ))}
        </ul>
      </div>
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
          <>
            <div className="flex h-1 grow flex-col overflow-y-auto bg-white px-4">
              <div className="sticky top-0 z-10 my-2 flex items-center justify-center">
                <TextEditorMenuBar editor={editor} />
              </div>
              <EditorContent
                editor={editor}
                className="my-3 w-[800px] grow cursor-text"
                onClick={editorFocusHandler}
              />
            </div>
            <div className="flex justify-between bg-white px-4 py-4">
              <button
                type="button"
                className="h-8 w-24 rounded-lg bg-red-500 text-sm text-white disabled:bg-gray-400"
                disabled={chapter === null}
                onClick={() => void deleteDraftChapterHandler()}
              >
                Delete
              </button>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="h-8 w-24 rounded-lg bg-authBlue-500 text-sm text-white hover:bg-authBlue-700"
                  onClick={() => void saveDraftChapterHandler()}
                >
                  Save
                </button>
                <Popover>
                  <Popover.Panel className="relative">
                    <div className="absolute -right-32 bottom-2 z-10">
                      <DateTimeInputField
                        initialDate={chapter ? chapter.publishedAt : null}
                        label={"Confirm Publish"}
                        onSubmit={(date: Date) =>
                          void publishDraftChapterHandler(date)
                        }
                      />
                    </div>
                  </Popover.Panel>
                  <Popover.Button className="h-8 rounded-lg border border-authGreen-600 px-2 text-sm font-semibold text-authGreen-600 outline-none hover:bg-gray-200 focus:outline-none">
                    Set Publish Date
                  </Popover.Button>
                </Popover>
                <button
                  type="button"
                  onClick={() => void publishDraftChapterHandler()}
                  className="h-8 w-28 rounded-lg bg-authGreen-500 text-sm font-semibold text-white hover:bg-authGreen-600"
                >
                  Publish Now
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CreateChapter;
