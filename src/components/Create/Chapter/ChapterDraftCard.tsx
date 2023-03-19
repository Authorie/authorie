import { PencilSquareIcon } from "@heroicons/react/24/solid";

type props = {
  title: string;
  onClickHandler: () => void;
};

const ChapterDraftCard = ({ title, onClickHandler }: props) => {
  return (
    <div
      onClick={onClickHandler}
      className="flex cursor-pointer items-center justify-between rounded-lg bg-white p-4 shadow-lg"
    >
      <span className="font-bold">{title}</span>
      <PencilSquareIcon className="text-bold h-5 w-5 text-authGreen-600" />
    </div>
  );
};

export default ChapterDraftCard;
