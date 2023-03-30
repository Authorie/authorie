type props = {
  icon: React.ElementType;
  title: string;
  action?: () => boolean;
  isActive?: () => boolean;
};

const TextEditorMenuToggle = ({
  icon: Icon,
  title,
  action,
  isActive,
}: props) => {
  if (action) {
    return (
      <button
        onClick={(e) => {
          action();
          e.preventDefault();
        }}
        title={title}
        className={`${
          isActive && isActive() ? "bg-gray-300" : "bg-transparent"
        } 
                m-1 rounded-md p-1 hover:bg-gray-300`}
      >
        <Icon className="h-4 w-4" />
      </button>
    );
  } else {
    return <div className="ml-2 mr-3 h-5 w-0.5 self-center bg-gray-300"></div>;
  }
};

export default TextEditorMenuToggle;
