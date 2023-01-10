import React from "react";

interface Props {
  Icon: (props: { width: number; height: number }) => JSX.Element;
  title: string;
}

const NavigationItem = ({ Icon, title }: Props) => {
  return (
    <li className="rounded-full py-4 hover:bg-gray-200">
      <a href="#" className="flex items-center justify-start gap-6 px-3">
        <Icon width={30} height={30} />
        <span className="hidden sm:block">{title}</span>
      </a>
    </li>
  );
};

export default NavigationItem;
