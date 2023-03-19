import BookComboBox from "@components/Create/Chapter/BookComboBox";
import ChapterDraftCard from "@components/Create/Chapter/ChapterDraftCard";
import TextEditor from "@components/Create/Chapter/TextEditor";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { BookStatus, type Book } from "@prisma/client";
import { appRouter } from "@server/api/root";
import { createInnerTRPCContext } from "@server/api/trpc";
import { getServerAuthSession } from "@server/auth";
import type { JSONContent } from "@tiptap/react";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { api } from "@utils/api";
import type { GetServerSidePropsContext } from "next";
import { useSession } from "next-auth/react";
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
  const [chapterId, setChapterId] = useState<string | undefined>();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState<JSONContent | null>(null);
  const [book, setBook] = useState<Book | null>(null);
  const context = api.useContext();
  const { data: user } = api.user.getData.useQuery(undefined, {
    enabled: status === "authenticated",
  });
  const { data: draftChapters } = api.chapter.getDrafts.useQuery(undefined, {
    enabled: status === "authenticated",
  });
  const createChapterMutation = api.chapter.create.useMutation();
  const onSaveHandler = () => {
    if (title !== "" && content) {
      createChapterMutation.mutate(
        {
          chapterId,
          title,
          content,
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
    if (title !== "" && content) {
      createChapterMutation.mutate(
        {
          chapterId,
          title,
          content,
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
    const draft = draftChapters?.find((chapter) => chapter.id === id);
    if (draft) {
      setChapterId(draft.id);
      setTitle(draft.title);
      setContent(draft.content as JSONContent);
      setBook(draft.book as Book);
    }
  };

  return (
    <div className="flex gap-4 rounded-b-2xl bg-white px-3 py-5">
      <div className="flex w-1/4 flex-col gap-3 rounded-lg bg-gray-100 p-4 shadow-lg">
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
                onSelectBook={setBook}
              />
            </div>
          )}
        </div>
        <div className="h-full bg-white px-8 py-6">
          <TextEditor content={content} onEditorUpdate={setContent} />
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
      </div>
    </div>
  );
};

export default CreateChapter;
