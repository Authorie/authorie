import Image from "next/image";
import type { ChangeEvent } from "react";
import { HiOutlinePhoto } from "react-icons/hi2";

type props = {
  coverImage?: string;
  title: string;
  setBookCover: (e: ChangeEvent<HTMLInputElement>) => void;
  isEdit: boolean;
  uploadCover?: string;
};

const BookCoverEditable = ({
  coverImage,
  title,
  setBookCover,
  isEdit,
  uploadCover,
}: props) => {
  return (
    <div className="relative flex h-52">
      {isEdit && (
        <label htmlFor="BookCover">
          <input
            id="BookCover"
            type="file"
            accept="image/png, image/jpeg"
            name="BookCover"
            className="hidden"
            onChange={setBookCover}
          />
          <HiOutlinePhoto className="absolute bottom-2 right-2 z-10 w-8 cursor-pointer rounded-md bg-gray-100" />
        </label>
      )}
      <div className="h-52 w-3 rounded-r-lg bg-gray-500 shadow-lg" />
      <div className="w-40">
        <div className="relative h-full w-full overflow-hidden rounded-l-lg">
          {coverImage || uploadCover ? (
            <Image
              src={uploadCover ? uploadCover : (coverImage as string)}
              alt={`cover image of the book called ${title}`}
              fill
            />
          ) : (
            <div className="h-full w-full bg-authGreen-400" />
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCoverEditable;
