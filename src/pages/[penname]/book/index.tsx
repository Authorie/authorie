import BookList from "~/components/Book/BookList";
import { BookStatus } from "@prisma/client";
import { getServerAuthSession } from "~/server/auth";
import { generateSSGHelper } from "~/server/utils";
import { api } from "~/utils/api";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { HiOutlineArchiveBox, HiOutlineArrowUturnLeft } from "react-icons/hi2";

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getServerAuthSession(context);
  const ssg = generateSSGHelper(session);
  const penname = context.query.penname as string;
  const promises = [ssg.user.getData.prefetch(penname)];
  if (session) promises.push(ssg.user.getData.prefetch(undefined));
  await Promise.allSettled(promises);

  return {
    props: {
      trpcState: ssg.dehydrate(),
      session,
      penname,
    },
  };
};

type props = InferGetServerSidePropsType<typeof getServerSideProps>;

const BookPage = ({ penname }: props) => {
  const { data: session } = useSession();
  const [openArchive, setOpenArchive] = useState(false);
  const { data: user } = api.user.getData.useQuery(penname);
  const { data: books, isLoading: bookIsLoading } = api.book.getAll.useQuery({
    penname,
  });
  const archiveBooks = books?.filter(
    (book) => book.status === BookStatus.ARCHIVED
  );
  const nonarchiveBooks = books?.filter(
    (book) => book.status !== BookStatus.ARCHIVED
  );
  return (
    <div className="mb-8 mt-6 w-[1024px]">
      <div className={"max-h-full rounded-lg p-4 px-6 shadow-lg"}>
        <div className="flex items-center justify-start">
          {!openArchive ? (
            <div
              onClick={() => setOpenArchive(true)}
              className="mb-3 flex cursor-pointer items-center justify-center gap-2 rounded-full bg-gray-400 px-4 py-1 text-sm font-semibold text-white hover:bg-gray-500"
            >
              <HiOutlineArchiveBox className="h-5 w-5" />
              <p>View Archived</p>
            </div>
          ) : (
            <div
              onClick={() => setOpenArchive(false)}
              className="mb-3 flex cursor-pointer items-center justify-center gap-2 rounded-full bg-authGreen-400 px-4 py-1 text-sm font-semibold text-white hover:bg-authGreen-500"
            >
              <HiOutlineArrowUturnLeft className="h-5 w-5" />
              <p>View Book Shelf</p>
            </div>
          )}
        </div>
        {user && books && archiveBooks && nonarchiveBooks && (
          <BookList
            books={openArchive ? archiveBooks : nonarchiveBooks}
            isOwner={user.id === session?.user.id}
            isArchived={openArchive}
            penname={penname}
          />
        )}
        {bookIsLoading && <p>Loading...</p>}
      </div>
      {openArchive && (
        <p className="mt-4 text-sm text-gray-600">
          Noted: Unarchive to make the book viewable again
        </p>
      )}
    </div>
  );
};

export default BookPage;
