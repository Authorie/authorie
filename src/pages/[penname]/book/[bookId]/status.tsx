import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import AuthorList from "@components/Book/AuthorList";
import BookDummy from "@components/Book/BookDummy";
import { BookStatus } from "@prisma/client";
import { useRouter } from "next/router";
import { api } from "@utils/api";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { getServerAuthSession } from "@server/auth";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { createInnerTRPCContext } from "@server/api/trpc";
import { appRouter } from "@server/api/root";
import superjson from "superjson";
import * as z from "zod";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import useImageUpload from "@hooks/imageUpload";
import { ToastContainer, toast } from "react-toastify";
import { useForm } from "react-hook-form";

const ListOfAuthors = [
  { penname: "Supakit Kuewsupakorn", status: "accept", pic: "/favicon.ico" },
  { penname: "fame", status: "accept", pic: "/favicon.ico" },
  { penname: "cos", status: "reject", pic: "/favicon.ico" },
  { penname: "ant", status: "not response", pic: "/favicon.ico" },
  { penname: "ken", status: "not response", pic: "/favicon.ico" },
];

const validationSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Title is required" })
    .max(100, { message: "Title is too long" }),
  description: z.string().max(500, { message: "Description is too long" }),
  author: z.string(),
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
  const bookId = context.query.bookId as string;
  await ssg.book.getData.prefetch({ id: bookId });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      session,
      bookId,
    },
  };
};

type props = InferGetServerSidePropsType<typeof getServerSideProps>;

const StatusPage = ({ bookId }: props) => {
  const router = useRouter();
  const { data: book } = api.book.getData.useQuery({ id: bookId });
  const [isEdit, setIsEdit] = useState(false);
  const {
    register,
    reset,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ValidationSchema>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });
  return (
    <div className="h-full w-full">
      <div className="relative m-8 overflow-hidden rounded-xl bg-white">
        <div
          onClick={() => router.back()}
          className="absolute inset-0 top-2 left-2 z-10 w-fit"
        >
          <ChevronLeftIcon className="h-8 w-8 cursor-pointer rounded-full border border-gray-500 bg-gray-200 p-1 hover:bg-gray-400" />
        </div>
        <div className="relative overflow-hidden rounded-tl-large shadow-lg">
          {book ? (
            <>
              <div className="absolute h-52 w-full overflow-hidden">
                {book.wallpaperImage ? (
                  <Image
                    src={book.wallpaperImage}
                    alt={`${book.title}'s wallpaper image`}
                    fill
                  />
                ) : (
                  <div className="h-full w-full bg-authGreen-400" />
                )}
                <div className="absolute inset-0 h-52 w-full bg-gradient-to-t from-white" />
              </div>
              <div className="flex flex-col p-5">
                <div className="z-10 mt-36 flex gap-5">
                  <BookDummy
                    title={book.title}
                    coverImage={book?.coverImage || ""}
                  />
                  <div className="mt-12 flex grow flex-col gap-3">
                    <h1 className="text-2xl font-bold">
                      Book Status:{" "}
                      <span className="text-yellow-600">{book.status}</span>
                    </h1>
                    <h1 className="text-3xl font-bold">{book.title}</h1>
                    <h3 className="text-sm text-gray-600">
                      {book?.description}
                    </h3>
                  </div>
                  <div className="mt-12 flex flex-col gap-3">
                    {book.status === BookStatus.INITIAL && (
                      <button className="rounded-full bg-gradient-to-b from-blue-400 to-blue-500 px-12 py-2 font-semibold text-white hover:bg-gradient-to-b hover:from-blue-500 hover:to-blue-600">
                        Start Writing
                      </button>
                    )}
                    {book.status === BookStatus.DRAFT && (
                      <button className="rounded-full bg-gradient-to-b from-green-400 to-green-500 px-12 py-2 font-semibold text-white hover:bg-gradient-to-b hover:from-green-500 hover:to-green-600">
                        Publish
                      </button>
                    )}
                    {book.status === BookStatus.PUBLISHED && (
                      <button className="rounded-full bg-gradient-to-b from-gray-400 to-gray-500 px-12 py-2 font-semibold text-white hover:bg-gradient-to-b hover:from-gray-500 hover:to-gray-600">
                        Completed
                      </button>
                    )}
                    {book.status === BookStatus.ARCHIVED && (
                      <button className="rounded-full bg-gradient-to-b from-green-400 to-green-500 px-12 py-2 font-semibold text-white hover:bg-gradient-to-b hover:from-green-500 hover:to-green-600">
                        Unarchive
                      </button>
                    )}
                    {book.status === BookStatus.INITIAL ||
                      (book.status === BookStatus.DRAFT && (
                        <button className="rounded-full bg-gradient-to-b from-red-400 to-red-500 px-12 py-2 font-semibold text-white hover:bg-gradient-to-b hover:from-red-500 hover:to-red-600">
                          Delete
                        </button>
                      ))}
                    {book.status === BookStatus.PUBLISHED ||
                      (book.status === BookStatus.COMPLETED && (
                        <button className="rounded-full bg-gradient-to-b from-red-400 to-red-500 px-12 py-2 font-semibold text-white hover:bg-gradient-to-b hover:from-red-500 hover:to-red-600">
                          Archive
                        </button>
                      ))}
                  </div>
                </div>
                <div className="mt-6 flex w-fit flex-col self-center rounded-lg p-4">
                  <div className="flex items-center justify-center">
                    <h1 className="text-xl font-bold">Author List</h1>
                  </div>
                  <div className="my-4 flex items-center justify-center gap-4">
                    <input
                      className="w-96 rounded-full border border-gray-300 px-5 py-1 outline-none focus:outline-none"
                      placeholder="Enter author's penname..."
                      {...register("author")}
                    />
                    <button className="rounded-lg bg-blue-500 px-4 py-1 text-white hover:bg-blue-600">
                      Invite
                    </button>
                  </div>
                  <div className="ml-20 flex gap-48 text-lg font-semibold">
                    <p>Author</p>
                    <p>Status</p>
                  </div>
                  <ol className="divide-y-2 self-center">
                    {ListOfAuthors.map((author, index) => (
                      <AuthorList
                        key={index}
                        number={index + 1}
                        penname={author.penname}
                        status={author.status}
                        authorPicture={author.pic}
                        bookStatus={book.status}
                      />
                    ))}
                  </ol>
                </div>
              </div>
            </>
          ) : (
            <div>
              <h1>This book does not exist</h1>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatusPage;
