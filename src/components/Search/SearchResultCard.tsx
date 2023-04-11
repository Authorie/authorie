import { type ReactNode } from "react";

interface props
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "className"> {
  children: ReactNode;
}

const SearchResultCard = ({ children, ...props }: props) => {
  return (
    <div
      {...props}
      className="flex h-fit cursor-pointer items-center gap-4 rounded bg-slate-50 px-4 shadow-lg transition duration-200 ease-in-out hover:-translate-y-1 hover:scale-[1.01]"
    >
      {children}
    </div>
  );
};

export default SearchResultCard;
