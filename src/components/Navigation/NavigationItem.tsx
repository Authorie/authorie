import Link from "next/link";
import React from "react";

const NavigationItem = ({
  href,
  children,
  className,
  ...props
}: React.ComponentPropsWithRef<typeof Link>) => {
  return (
    <li>
      <Link
        {...props}
        href={href}
        className={`flex items-center justify-start gap-4 rounded-full p-2 hover:bg-gray-200 ${
          className || ""
        }`}
      >
        {children}
      </Link>
    </li>
  );
};

export default NavigationItem;
