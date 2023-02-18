type props = {
  title: string;
  onClick: () => void;
};

const Choice = ({ title, onClick }: props) => {
  return (
    <button
      onClick={onClick}
      className="rounded-3xl bg-authGreen-500 py-[7px] px-3 text-center text-sm font-semibold hover:bg-authGreen-600"
    >
      {title}
    </button>
  );
};

export default Choice;
