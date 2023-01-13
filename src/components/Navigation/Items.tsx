import NextLink from "next/link";
import React from "react";

const baseClasses =
  "w-full flex items-center justify-start gap-4 rounded-full p-2 hover:bg-gray-200";

export const Button = ({
  children,
  className,
  parentClassName,
  ...props
}: React.ComponentPropsWithRef<"button"> & { parentClassName?: string }) => {
  return (
    <li className={parentClassName}>
      <button
        {...props}
        className={`${baseClasses} ${className ? className : ""}`}
      >
        {children}
      </button>
    </li>
  );
};

export const Link = ({
  href,
  children,
  className,
  parentClassName,
  ...props
}: React.ComponentPropsWithRef<typeof NextLink> & {
  parentClassName?: string;
}) => {
  return (
    <li className={parentClassName}>
      <NextLink
        {...props}
        href={href}
        className={`${baseClasses} ${className ? className : ""}`}
      >
        {children}
      </NextLink>
    </li>
  );
};
