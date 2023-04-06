import NextLink from "next/link";
import React from "react";

const baseClasses =
  "w-full flex items-center justify-start gap-4 rounded-full p-2 hover:bg-gray-200";

export const Button = ({
  children,
  className,
  ...props
}: React.ComponentPropsWithRef<"button">) => {
  return (
    <button
      className={`${baseClasses} ${className ? className : ""}`}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
};

export const Link = ({
  href,
  children,
  className,
  ...props
}: React.ComponentPropsWithRef<typeof NextLink>) => {
  return (
    <NextLink
      href={href}
      className={`${baseClasses} ${className ? className : ""}`}
      {...props}
    >
      {children}
    </NextLink>
  );
};
