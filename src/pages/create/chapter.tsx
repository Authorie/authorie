import BookComboBox from "@components/Create/Chapter/BookComboBox";
import ChapterDraftCard from "@components/Create/Chapter/ChapterDraftCard";
import { Heading } from "@components/Create/Chapter/TextEditorMenu/Heading";
import TextEditorMenuBar from "@components/Create/Chapter/TextEditorMenu/TextEditorMenuBar";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useForm, type SubmitHandler } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import superjson from "superjson";
import * as z from "zod";

const validationSchema = z.object({
  title: z
    .string()
    .max(80, { message: "Your title is too long" })
    .min(1, { message: "Your title is required" }),
});

type ValidationSchema = z.infer<typeof validationSchema>;

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
  const [book, setBook] = useState<Book | null>(null);
  const [chapterId, setChapterId] = useState<string | undefined>();
  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<ValidationSchema>({
    resolver: zodResolver(validationSchema),
  });
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
  const deleteChapterMutation = api.chapter.deleteDraft.useMutation();
  const onDeleteHandler = async () => {
    if (chapterId) {
      const promise = deleteChapterMutation.mutateAsync(
        {
          id: chapterId,
        },
        {
          onSettled() {
            void context.chapter.getDrafts.invalidate();
          },
        }
      );
      await toast.promise(promise, {
        pending: "Deleting...",
        success: "Deleted!",
        error: "Error deleting",
      });
    } else {
      toast.error("Chapter not saved yet");
    }
  };
  const onSaveHandler: SubmitHandler<ValidationSchema> = async (data) => {
    if (editor && data.title !== "") {
      const promise = createChapterMutation.mutateAsync(
        {
          chapterId,
          title: data.title,
          content: editor.getJSON(),
          bookId: book ? book.id : undefined,
        },
        {
          onSettled() {
            void context.chapter.getDrafts.invalidate();
          },
        }
      );
      await toast.promise(promise, {
        pending: "Saving...",
        success: "Saved!",
        error: "Error saving",
      });
    }
  };
  const onPublishHandler: SubmitHandler<ValidationSchema> = (data) => {
    if (editor && data.title !== "") {
      const promise = createChapterMutation.mutateAsync(
        {
          chapterId,
          title: data.title,
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
      void toast
        .promise(promise, {
          pending: "Publishing...",
          success: "Published!",
          error: "Error publishing",
        })
        .catch((err) => console.error(err));
    }
  };
  const selectDraftHandler = (id: string | undefined) => {
    if (!editor) return;
    const draft = draftChapters?.find((chapter) => chapter.id === id);
    if (draft) {
      setChapterId(draft.id);
      setValue("title", draft.title);
      editor?.commands.setContent(draft.content as JSONContent);
      setBook(draft.book as Book);
    } else {
      setChapterId(undefined);
      setValue("title", "");
      editor?.commands.setContent("");
      setBook(null);
    }
  };

  return (
    <>
      <div className="flex h-full gap-4 rounded-b-2xl bg-white px-4 py-5">
        <div className="flex h-[88vh] basis-1/4 flex-col gap-3 rounded-lg bg-gray-200 p-4 shadow-xl drop-shadow">
          <h1 className="text-xl font-bold">Draft Chapters</h1>
          <p className="text-xs">
            Select one of previous drafts, or you can create a new one.
          </p>
          <ChapterDraftCard
            title="Create a new chapter"
            selected={chapterId === undefined}
            onClickHandler={() => selectDraftHandler(undefined)}
          />
          {draftChapters &&
            draftChapters.map((chapter) => (
              <ChapterDraftCard
                key={chapter.id}
                title={chapter.title}
                selected={chapterId === chapter.id}
                onClickHandler={() => selectDraftHandler(chapter.id)}
              />
            ))}
        </div>
        <form className="flex h-[88vh] w-[830px] grow flex-col overflow-y-scroll rounded-lg bg-gray-100 shadow-xl drop-shadow">
          <div className="relative flex flex-col bg-gray-200 px-4 py-3">
            <div className="absolute inset-0 cursor-pointer">
              {book && book.wallpaperImage && (
                <NextImage
                  src={book.wallpaperImage}
                  alt="chapter's cover"
                  fill
                />
              )}
            </div>
            <div className="z-10">
              <input
                placeholder="Untitled"
                {...register("title")}
                className="w-fit bg-transparent text-2xl font-semibold placeholder-gray-400 outline-none focus:outline-none"
              />
              {errors.title && (
                <p className="text-xs text-red-400" role="alert">
                  {errors.title.message}
                </p>
              )}
              <div className="my-2 flex items-center">
                <span className="mr-4 text-xs text-gray-600">Author </span>
                {user && <span className="text-xs">{user.penname}</span>}
              </div>
              {user && (
                <div className="flex items-center">
                  <span className="mr-4 text-xs text-gray-600">Book </span>
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
            <div className="flex flex-1 flex-col bg-white px-4">
              <div className="sticky top-0 z-10 my-2 rounded-lg bg-gray-200 py-1">
                <TextEditorMenuBar editor={editor} />
              </div>
              <EditorContent className="flex-1 rounded py-2" editor={editor} />
              <div className="sticky bottom-0 flex justify-between bg-white px-4 py-4">
                <button
                  type="button"
                  className="h-6 w-24 rounded-lg bg-red-500 text-sm text-white"
                  onClick={() => void onDeleteHandler()}
                >
                  Delete
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    className="h-6 w-24 rounded-lg bg-authBlue-500 text-sm text-white"
                    onClick={(e) => void handleSubmit(onSaveHandler)(e)}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={(e) => void handleSubmit(onPublishHandler)(e)}
                    className="h-6 w-24 rounded-lg bg-authGreen-600 text-sm font-semibold text-white"
                  >
                    Publish
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
      <ToastContainer />
    </>
  );
};

export default CreateChapter;
