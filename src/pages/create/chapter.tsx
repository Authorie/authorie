import BookComboBox from "@components/Create/Chapter/BookComboBox";
import ChapterDraftCard from "@components/Create/Chapter/ChapterDraftCard";
import { Heading } from "@components/Create/Chapter/TextEditorMenu/Heading";
import TextEditorMenuBar from "@components/Create/Chapter/TextEditorMenu/TextEditorMenuBar";
import { PhotoIcon } from "@heroicons/react/24/outline";
import useImageUpload from "@hooks/imageUpload";
import { BookStatus, type Book } from "@prisma/client";
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
import superjson from "superjson";

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
  const [book, setBook] = useState<Book | null>(null);
  const [chapterId, setChapterId] = useState<string | undefined>();
  const { imageData, uploadHandler, setImageData } = useImageUpload();
  const editor = useEditor({
    content: "",
    extensions: [
      StarterKit.configure({
        heading: false,
        paragraph: {
          HTMLAttributes: {
            class: "text-base",
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
        class: "focus:outline-none h-full w-full px-5",
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
  const onSaveHandler = () => {
    if (editor && title !== "") {
      createChapterMutation.mutate(
        {
          chapterId,
          title,
          content: editor.getJSON(),
          bookId: book ? book.id : undefined,
        },
        {
          onSettled() {
            void context.chapter.getDrafts.invalidate();
          },
        }
      );
    }
  };
  const onPublishHandler = () => {
    if (editor && title !== "") {
      createChapterMutation.mutate(
        {
          chapterId,
          title,
          content: editor.getJSON(),
          bookId: book ? book.id : undefined,
          publishedAt: true,
        },
        {
          onSettled() {
            void context.chapter.getDrafts.invalidate();
          },
        }
      );
    }
  };
  const selectDraftHandler = (id: string) => {
    if (!editor) return;
    const draft = draftChapters?.find((chapter) => chapter.id === id);
    if (draft) {
      setChapterId(draft.id);
      setTitle(draft.title);
      editor?.commands.setContent(draft.content as JSONContent);
      setBook(draft.book as Book);
      setImageData(""); // set image data to empty string to reset image preview
    }
  };

  return (
    <div className="flex h-full gap-4 rounded-b-2xl bg-white px-3 py-5">
      <div className="flex basis-1/4 flex-col gap-3 rounded-lg bg-gray-100 p-4 shadow-lg">
        <h1 className="text-xl font-bold">Chapter drafts</h1>
        <p className="text-xs">
          Select one of previous chapter drafts, or you can create a new one.
        </p>
        {draftChapters &&
          draftChapters.map((chapter) => (
            <ChapterDraftCard
              key={chapter.id}
              title={chapter.title}
              onClickHandler={() => selectDraftHandler(chapter.id)}
            />
          ))}
      </div>
      <div className="flex flex-1 flex-col overflow-hidden rounded-lg bg-gray-100 shadow-lg">
        <div className="relative flex flex-col bg-gray-200 px-4 py-3">
          <label
            className="absolute inset-0 cursor-pointer"
            htmlFor="chapter-cover-image-upload"
          >
            {imageData && (
              <NextImage src={imageData} alt="chapter's cover" fill />
            )}
            <input
              hidden
              id="chapter-cover-image-upload"
              type="file"
              accept="image/jpeg; image/png"
              onChange={uploadHandler}
            />
          </label>
          <PhotoIcon className="h-6 w-6 cursor-pointer" />
          <div className="z-10">
            <input
              placeholder="Untitled"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="my-2 w-fit bg-transparent text-2xl font-semibold placeholder-gray-400 outline-none focus:outline-none"
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
                  onSelectBook={setBook}
                />
              </div>
            )}
          </div>
        </div>
        {editor && (
          <div className="flex flex-1 flex-col bg-white px-8 py-6">
            <div className="flex flex-1 flex-col">
              <TextEditorMenuBar editor={editor} />
              <EditorContent editor={editor} />
            </div>
            <div className="flex justify-between">
              <button className="h-6 w-24 rounded-lg bg-red-500 text-sm text-white">
                Delete
              </button>
              <div className="flex gap-3">
                <button
                  className="h-6 w-24 rounded-lg bg-authBlue-500 text-sm text-white"
                  onClick={onSaveHandler}
                >
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
        )}
      </div>
    </div>
  );
};

export default CreateChapter;
