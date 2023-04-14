import { HiPencilSquare } from "react-icons/hi2";

type props = {
  title: string;
  selected: boolean;
  onClickHandler: () => void;
  publishedAt?: Date | null;
};

const ChapterDraftCard = ({
  title,
  selected,
  onClickHandler,
  publishedAt,
}: props) => {
  return (
    <li
      onClick={onClickHandler}
      className={`relative flex cursor-pointer items-center justify-between rounded-lg p-4 ${
        publishedAt
          ? selected
            ? "bg-authGreen-600 text-white shadow-inner"
            : "bg-authGreen-400 text-white shadow-xl hover:bg-authGreen-500"
          : selected
          ? "bg-dark-200 shadow-inner"
          : `bg-white shadow-xl hover:bg-gray-200`
      } `}
    >
      <span className="line-clamp-2 w-52 font-bold">{title}</span>
      <HiPencilSquare className="text-bold h-5 w-5 text-authGreen-600" />
    </li>
  );
};

export default ChapterDraftCard;
