import { Popover } from "@headlessui/react";
import { type Book, BookStatus, type Chapter } from "@prisma/client";
import type { Editor } from "@tiptap/react";
import { EditorContent } from "@tiptap/react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import DateTimeInputField from "~/components/DateTimeInput/DateTimeInputField";
import { api } from "~/utils/api";
import TextEditorMenuBar from "./TextEditorMenu/TextEditorMenuBar";

type props = {
  editor: Editor;
  title: string;
  book: Book | null;
  price: number | undefined;
  selectedChapter: Chapter | null;
  setErrors: (errors: { title: string | undefined }) => void;
  selectDraftHandler: (
    chapter: (Chapter & { book: Book | null }) | null
  ) => void;
};

const CreateChapterBoard = ({
  editor,
  selectedChapter,
  title,
  price,
  book,
  setErrors,
  selectDraftHandler,
}: props) => {
  const router = useRouter();
  const utils = api.useContext();
  const createChapterMutation = api.chapter.create.useMutation({
    onSuccess(data, variables, _context) {
      void utils.chapter.invalidate();
      if (variables.bookId) {
        void utils.book.getData.invalidate({ id: variables.bookId });
      }
      void router.replace(`/create/chapter?chapterId=${data.id}`);
    },
  });
  const deleteChapterMutation = api.chapter.deleteDraft.useMutation({
    onSuccess(_data, _variables, _context) {
      void utils.chapter.getDrafts.invalidate();
      if (book) void utils.book.getData.invalidate({ id: book.id });
    },
  });
  const deleteDraftChapterHandler = async () => {
    if (!selectedChapter) {
      toast.error("Chapter not saved yet");
      return;
    }
    const promise = deleteChapterMutation.mutateAsync({
      id: selectedChapter.id,
    });
    await toast.promise(promise, {
      loading: "Deleting...",
      success: "Deleted!",
      error: "Error deleting",
    });
  };
  const saveDraftChapterHandler = async () => {
    if (title === "") {
      setErrors({
        title: "The title is required!",
      });
      return;
    } else if (title.trim().length > 80) {
      setErrors({ title: "The title is too long" });
      return;
    }
    const promise = createChapterMutation.mutateAsync({
      chapterId: selectedChapter?.id,
      title,
      content: editor.getJSON(),
      bookId: book ? book.id : undefined,
      publishedAt: null,
    });
    await toast.promise(promise, {
      loading: "Saving...",
      success: "Saved!",
      error: "Error saving",
    });
  };
  const publishDraftChapterHandler = async (date?: Date) => {
    if (!editor) return;

    if (title === "") {
      setErrors({ title: "The title is required!" });
      return;
    }

    if (title.trim().length > 80) {
      setErrors({ title: "The title is too long" });
      return;
    }

    if (!book) {
      toast.error("Please select a book first");
      return;
    }

    if (book.status !== BookStatus.PUBLISHED) {
      toast.error("Please publish the book first");
      return;
    }

    const promise = createChapterMutation.mutateAsync(
      {
        chapterId: selectedChapter?.id,
        title: title,
        content: editor.getJSON(),
        bookId: book.id,
        publishedAt: date || true,
        price: price,
      },
      {
        onSuccess() {
          selectDraftHandler(null);
        },
      }
    );
    await toast.promise(promise, {
      loading: "Publishing...",
      success: "Published!",
      error: "Error publishing",
    });
  };

  return (
    <>
      <div className="flex h-1 grow flex-col overflow-y-auto bg-white px-4">
        <div className="sticky top-0 z-10 my-2 flex items-center justify-center">
          <TextEditorMenuBar editor={editor} />
        </div>
        <EditorContent
          editor={editor}
          className="my-3 w-[800px] grow cursor-text"
          onClick={() => editor.commands.focus()}
        />
      </div>
      <div className="flex justify-between bg-white px-4 py-4">
        {!selectedChapter?.publishedAt && (
          <button
            type="button"
            className="h-8 w-24 rounded-lg bg-red-500 text-sm text-white hover:bg-red-700 disabled:bg-gray-400"
            disabled={selectedChapter === null}
            onClick={() => void deleteDraftChapterHandler()}
          >
            Delete
          </button>
        )}
        {selectedChapter?.publishedAt && (
          <button
            type="button"
            className="h-8 w-32 rounded-lg bg-red-500 text-sm text-white hover:bg-red-700"
            onClick={() => void saveDraftChapterHandler()}
          >
            Cancel Publish
          </button>
        )}
        <div className="flex items-end gap-3">
          {!selectedChapter?.publishedAt && (
            <>
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
                      initialDate={
                        selectedChapter ? selectedChapter.publishedAt : null
                      }
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
            </>
          )}
          {selectedChapter?.publishedAt && (
            <div>
              <div className="flex items-end gap-3">
                <Popover>
                  <Popover.Panel className="relative">
                    <div className="absolute -right-32 bottom-2 z-10">
                      <DateTimeInputField
                        initialDate={
                          selectedChapter ? selectedChapter.publishedAt : null
                        }
                        label={"Update"}
                        onSubmit={(date: Date) =>
                          void publishDraftChapterHandler(date)
                        }
                      />
                    </div>
                  </Popover.Panel>
                  <Popover.Button className="h-8 rounded-lg border border-authGreen-600 px-2 text-sm font-semibold text-authGreen-600 outline-none hover:bg-gray-200 focus:outline-none">
                    Update Now
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
          )}
        </div>
      </div>
    </>
  );
};

export default CreateChapterBoard;
