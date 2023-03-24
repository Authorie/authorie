import { StarIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import ChapterCard from "@components/Chapter/ChapterCard";
import {
  ChevronLeftIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import {
  Bars3CenterLeftIcon,
  EyeIcon,
  HeartIcon,
} from "@heroicons/react/24/solid";
import Image from "next/image";
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
import { useMemo } from "react";
import Link from "next/link";

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

const BookContent = ({ bookId }: props) => {
  const router = useRouter();
  const { data: book } = api.book.getData.useQuery({ id: bookId });
  const utils = api.useContext();
  const { data: isFavorite } = api.book.isFavorite.useQuery({ id: bookId });
  const unfavoriteBook = api.book.unfavorite.useMutation({
    onMutate: async () => {
      await utils.book.isFavorite.cancel();
      const previousFavorite = utils.book.isFavorite.getData();
      utils.book.isFavorite.setData({ id: bookId }, (old) => !old);
      return { previousFavorite };
    },
    onSettled: () => {
      void utils.book.invalidate();
    },
  });
  const favoriteBook = api.book.favorite.useMutation({
    onMutate: async () => {
      await utils.book.isFavorite.cancel();
      const previousFavorite = utils.book.isFavorite.getData();
      utils.book.isFavorite.setData({ id: bookId }, (old) => !old);
      return { previousFavorite };
    },
    onSettled: () => {
      void utils.book.invalidate();
    },
  });
  const totalViews = useMemo(() => {
    if (book) {
      return book.chapters.reduce((acc, curr) => acc + curr.views, 0);
    } else {
      return 0;
    }
  }, [book]);
  const totalLikes = useMemo(() => {
    if (book) {
      return book.chapters.reduce((acc, curr) => acc + curr._count.likes, 0);
    } else {
      return 0;
    }
  }, [book]);
  const toggleFavoriteHandler = () => {
    if (isFavorite) {
      unfavoriteBook.mutate({ id: bookId });
    } else {
      favoriteBook.mutate({ id: bookId });
    }
  };

  return (
    <div className="relative mx-14 my-8 flex flex-col gap-8 rounded-xl bg-white px-7 pt-8 shadow-lg">
      <div className="absolute inset-0 h-96 w-full overflow-hidden rounded-lg rounded-tl-large">
        {book?.wallpaperImage ? (
          <Image src={book.wallpaperImage} alt="book's wallpaper image" fill />
        ) : (
          <div className="h-full w-full bg-authGreen-400" />
        )}
        <div className="absolute inset-0 z-10 h-96 w-full bg-gradient-to-t from-white" />
      </div>
      <div
        onClick={() => router.back()}
        className="absolute inset-0 top-2 left-2 z-10"
      >
        <ChevronLeftIcon className="h-8 w-8 cursor-pointer rounded-full border border-gray-500 bg-gray-200 p-1 hover:bg-gray-400" />
      </div>
      {book && (
        <div className="z-10 flex gap-7 pt-10 pb-5">
          <div className="ml-7 mb-20 flex flex-col">
            <div className="flex">
              <div className="h-52 w-3 rounded-r-lg bg-white shadow-lg" />
              <div className="w-40 rounded-l-lg bg-white shadow-lg">
                <div className="relative h-full w-full overflow-hidden rounded-l-lg">
                  {book?.coverImage ? (
                    <Image
                      src={book.coverImage}
                      alt="book's cover image"
                      fill
                    />
                  ) : (
                    <div className="h-full w-full bg-authGreen-400" />
                  )}
                  {!book.isOwner && (
                    <button onClick={toggleFavoriteHandler}>
                      {isFavorite ? (
                        <StarIcon className="absolute bottom-0 right-0 h-10 w-10 text-yellow-400 hover:text-yellow-500" />
                      ) : (
                        <StarIconSolid className="absolute bottom-0 right-0 h-10 w-10 text-yellow-400 hover:text-yellow-500" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-8 gap-1">
              <div className="mb-3 flex flex-col">
                {book.owners.map((author) => (
                  <h2 key={author.user.id} className="text-xl font-semibold">
                    {author.user.penname}
                  </h2>
                ))}
                <p className="text-sm font-light">
                  {book.categories.map((c) => c.category.title).join(" ")}
                </p>
              </div>
              <div className="my-7 flex flex-col gap-4">
                <button className="h-10 w-36 rounded-lg bg-gray-800 font-semibold text-white">
                  Auction book
                </button>
                <button className="h-10 w-36 rounded-lg bg-gray-800 font-semibold text-white">
                  Complete book
                </button>
              </div>
              <div className="my-10 flex flex-col gap-1">
                <span className="text-6xl font-bold">12</span>
                <p className="text-xl font-bold text-authGreen-600">chapters</p>
              </div>
              <div className="flex gap-8">
                <div className="flex flex-col items-center gap-2">
                  <p className="text-xl font-bold text-authGreen-600">
                    {totalViews}
                  </p>
                  <EyeIcon className="h-5 w-5 text-authGreen-600" />
                </div>
                <div className="flex  flex-col items-center gap-2">
                  <p className="text-xl font-bold text-authGreen-600">
                    {totalLikes}
                  </p>
                  <HeartIcon className="h-5 w-5 text-authGreen-600" />
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex h-52 w-3/5 flex-col justify-center gap-5">
              <div className="flex gap-4">
                <h1 className="text-3xl font-bold">{book.title}</h1>
                <button className="cursor-pointer">
                  <PencilSquareIcon
                    className={`w-7 ${
                      book.isOwner ? "text-gray-800" : "text-gray-100"
                    }`}
                  />
                </button>
              </div>
              <p className="text-xs font-light">{book.description}</p>
            </div>
            <div className="flex gap-2 self-end">
              <Bars3CenterLeftIcon className="h-7 w-7 rounded-lg bg-gray-200" />
              <MagnifyingGlassIcon className="h-7 w-7 rounded-lg bg-gray-200" />
            </div>
            <div className="mt-3 flex w-[800px] grow items-center justify-center rounded-sm bg-authGreen-300 shadow-lg">
              {book.chapters.length !== 0 && (
                <div className="grid w-fit grid-cols-2 gap-x-4 gap-y-1 p-4">
                  {book.chapters.map((chapter) => (
                    <ChapterCard key={chapter.id} chapter={chapter} />
                  ))}
                </div>
              )}
              {book.chapters.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-5">
                  <p className="text-lg font-semibold text-black">
                    This book does not have any chapters yet.
                  </p>
                  {book.isOwner && (
                    <Link
                      href="/create/chapter"
                      className="rounded-lg bg-green-600 px-3 py-2 text-white hover:bg-green-700"
                    >
                      Create Chapter
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookContent;
