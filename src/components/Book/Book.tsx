import { EyeIcon, HeartIcon, StarIcon } from "@heroicons/react/24/outline";
import Image from "next/legacy/image";
import { useRouter } from "next/router";
import StarIconSolid from "@heroicons/react/24/solid/StarIcon";
import type { MouseEvent } from "react";
import { api } from "@utils/api";

type props = {
  id: string;
  title: string;
  description: string | null;
  read: number;
  like: number;
};

const Book = ({ title, description, read, like, id }: props) => {
  const router = useRouter();
  const utils = api.useContext();
  const { data: isFavorite } = api.book.isFavorite.useQuery({ id: id });
  const unfavoriteBook = api.book.unfavorite.useMutation({
    onMutate: async () => {
      await utils.book.isFavorite.cancel();
      const previousFavorite = utils.book.isFavorite.getData();
      utils.book.isFavorite.setData({ id: id }, (old) => !old);
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
      utils.book.isFavorite.setData({ id: id }, (old) => !old);
      return { previousFavorite };
    },
    onSettled: () => {
      void utils.book.invalidate();
    },
  });

  const onClickHandler = () => {
    const penname: string = router.query.penname as string;
    void router.push(`/${penname}/book/${id}`);
  };

  const addFavoriteHandler = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    favoriteBook.mutate({ id: id });
    console.log("add");
  };

  const removeFavoriteHandler = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    unfavoriteBook.mutate({ id: id });
    console.log("remove");
  };

  return (
    <div
      onClick={onClickHandler}
      className="flex cursor-pointer transition duration-100 ease-in-out hover:-translate-y-1 hover:scale-[1.01]"
    >
      <div className="h-72 w-3 rounded-r-lg bg-authGreen-600 shadow-lg" />
      <div className="flex w-52 flex-col rounded-l-lg bg-white pb-2 shadow-lg">
        <div className="relative h-28 w-full overflow-hidden rounded-tl-lg">
          <Image src="/mockWallpaper.jpeg" alt="book picture" layout="fill" />
          {!isFavorite && (
            <button onClick={addFavoriteHandler}>
              <StarIcon className="absolute bottom-0 right-0 h-10 w-10 text-yellow-400 hover:text-yellow-500" />
            </button>
          )}
          {isFavorite && (
            <button onClick={removeFavoriteHandler}>
              <StarIconSolid className="absolute bottom-0 right-0 h-10 w-10 text-yellow-400 hover:text-yellow-500" />
            </button>
          )}
        </div>
        <div className="flex grow flex-col justify-between px-2 pt-2">
          <div className="flex w-full flex-col justify-center gap-2">
            <h1 className="font-bold">{title}</h1>
            <p className="text-xs font-light line-clamp-6">{description}</p>
          </div>
          <div className="flex justify-between">
            <div className="mt-2 flex items-center gap-1">
              <EyeIcon className="h-5 w-5 text-authGreen-600" />
              <p className="text-xs font-medium text-authGreen-600">{read}</p>
            </div>
            <div className="mt-2 flex items-center gap-1">
              <HeartIcon className="h-5 w-5 text-red-400" />
              <p className="text-xs font-medium text-red-400">{like}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Book;
