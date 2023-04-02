import { HiPencilSquare } from "react-icons/hi2";

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
      <HiPencilSquare className="text-bold h-5 w-5 text-authGreen-600" />
    </li>
  );
};

export default ChapterDraftCard;
