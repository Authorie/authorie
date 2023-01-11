import React from "react";

interface Props {
  Icon: (props: { width: number; height: number }) => JSX.Element;
  title: string;
  className?: string;
}

const NavigationItem = ({ Icon, title, className }: Props) => {
  return (
    <li>
      <a
        href="#"
        className={`flex items-center justify-start gap-6 rounded-full p-4 hover:bg-gray-200 ${
          className || ""
        }`}
      >
        <Icon width={30} height={30} />
        <span className="hidden md:block">{title}</span>
      </a>
    </li>
  );
};

export default NavigationItem;
