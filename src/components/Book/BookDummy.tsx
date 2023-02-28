import Image from "next/image";
import { StarIcon } from "@heroicons/react/24/outline";

const BookDummy = () => {
  return (
    <div className="flex">
      <div className="h-52 w-3 rounded-r-lg bg-white shadow-lg" />
      <div className="w-40 rounded-l-lg bg-white shadow-lg">
        <div className="relative h-full w-full overflow-hidden rounded-tl-lg">
          <Image src="/mockWallpaper.jpeg" alt="book picture" layout="fill" />
          <StarIcon className="absolute bottom-0 right-0 h-10 w-10 text-yellow-400" />
        </div>
      </div>
    </div>
  );
};

export default BookDummy;
