import { PencilSquareIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/router";

type props = {
  title: string;
  id: string;
};

const ChapterDraftCard = ({ title, id }: props) => {
  const router = useRouter();
  const onClickHandler = () => {
    void router.push(`/create/chapter/${id}`);
  };

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
