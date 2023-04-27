type props = {
  title: string;
  description: string;
  buttonName: string;
  buttonColor: string;
  onClick: () => void;
};

const UserTutorial = ({
  title,
  description,
  buttonName,
  buttonColor,
  onClick,
}: props) => {
  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-center text-4xl font-bold">{title}</p>
      {description && (
        <div className="flex h-14 max-w-4xl items-center justify-center text-center text-xl font-semibold">
          <span>{description}</span>
        </div>
      )}
      <button
        onClick={onClick}
        className={`h-10 w-36 rounded-lg bg-${buttonColor}-500 font-semibold text-white outline-none hover:bg-${buttonColor}-600 focus:outline-none`}
      >
        {buttonName}
      </button>
    </div>
  );
};

export default UserTutorial;
