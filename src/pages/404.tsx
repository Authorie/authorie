import type { ReactElement } from "react";
import Head from "next/head";

export default function Custom404() {
  return (
    <>
      <Head>
        <title>Authorie</title>
        <meta
          name="description"
          content="Social media and publishing platform!"
        />
      </Head>
      <div className="flex min-h-screen items-center justify-center">
        <h1 className="text-2xl font-medium">404 | Page Not Found</h1>
      </div>
    </>
  );
}

Custom404.getLayout = function getLayout(page: ReactElement) {
  return page;
};
