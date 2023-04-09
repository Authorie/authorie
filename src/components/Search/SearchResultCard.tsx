import { type ReactNode } from "react";

interface props
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "className"> {
  children: ReactNode;
}

const SearchResultCard = ({ children, ...props }: props) => {
  return (
    <div
      {...props}
      className="flex cursor-pointer gap-4 rounded pr-2 shadow drop-shadow transition duration-200 ease-in-out hover:-translate-y-1 hover:scale-[1.01]"
    >
      {children}
    </div>
  );
};

export default SearchResultCard;
