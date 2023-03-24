import Image from "next/image";

type props = {
  coverImage?: string;
  title: string;
};

const BookDummy = ({ coverImage, title }: props) => {
  return (
    <div className="flex">
      <div className="h-52 w-3 rounded-r-lg bg-gray-500 shadow-lg" />
      <div className="w-40">
        <div className="relative h-full w-full overflow-hidden rounded-l-lg">
          {coverImage ? (
            <Image
              src={coverImage}
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

export default BookDummy;
