import { PencilSquareIcon } from "@heroicons/react/24/solid";

type props = {
  title: string;
  selected: boolean;
  onClickHandler: () => void;
};

const ChapterDraftCard = ({ title, selected, onClickHandler }: props) => {
  return (
    <li
      onClick={onClickHandler}
      className={`flex cursor-pointer items-center justify-between rounded-lg p-4 ${
        selected ? "bg-dark-200 shadow-inner" : " bg-white shadow-xl"
      }`}
    >
      <span className="font-bold">{title}</span>
      <PencilSquareIcon className="text-bold h-5 w-5 text-authGreen-600" />
    </li>
  );
};

export default ChapterDraftCard;
