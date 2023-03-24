import { ChevronLeftIcon } from "@heroicons/react/24/outline";
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
  return (
    <div className="relative mx-14 my-8 flex w-full flex-col gap-8 rounded-xl bg-white px-7 pt-8 shadow-lg">
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
    </div>
  );
};

export default StatusPage;
