import React from "react";

const NavigationItem = ({
  children,
  className,
}: React.ComponentPropsWithRef<"a">) => {
  return (
    <li>
      <a
        href="#"
        className={`flex items-center justify-start gap-4 rounded-full p-2 hover:bg-gray-200 ${
          className || ""
        }`}
      >
        {children}
      </a>
    </li>
  );
};

export default NavigationItem;
