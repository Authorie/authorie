import type { ReactElement } from "react";

export default function Custom404() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <h1 className="text-2xl font-medium">404 | Page Not Found</h1>
    </div>
  );
}

Custom404.getLayout = function getLayout(page: ReactElement) {
  return page;
};
