import { DocumentIcon } from "@heroicons/react/24/solid";

type props = {
  title: string;
  date: Date;
  author: string;
  book: string;
  content: string;
};

const SearchChapterResult = ({ title, date, author, book, content }: props) => {
  const onClickCard = () => {
    console.log("redirect");
  };

  return (
    <div
      onClick={onClickCard}
      className="flex h-44 cursor-pointer gap-4 rounded shadow-lg transition duration-300 ease-in-out hover:-translate-y-1 hover:scale-[1.01]"
    >
      <div className="flex w-2/12 items-center justify-center rounded-l bg-authBlue-500">
        <DocumentIcon className="h-12 w-12 fill-white" />
      </div>
      <div className="mr-2 w-10/12 py-3 pr-10">
        <p className="text-xs font-semibold text-authBlue-500">CHAPTER</p>
        <h1 className="text-2xl font-bold text-authBlue-500">{title}</h1>
        <div className="flex gap-10 text-xs text-dark-400">
          <p>{`publish : ${date.toLocaleDateString()}`}</p>
          <p>{`author : ${author}`}</p>
          <p>{`book : ${book}`}</p>
        </div>
        <p className="my-4 text-xs text-dark-600">{content}</p>
      </div>
    </div>
  );
};

export default SearchChapterResult;
