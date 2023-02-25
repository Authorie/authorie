import type { PropsWithChildren } from "react";
import Head from "next/head";
import NavigationSidebar from "./Navigation/NavigationSidebar";
import { useRouter } from "next/router";

const Layout = ({
  children,
  isLogin,
}: PropsWithChildren<{ isLogin: boolean }>) => {
  const router = useRouter();

  if (router.pathname === "/auth/new-user") {
    return <>{children}</>;
  }

  return (
    <>
      <Head>
        <title>Authorie</title>
        <meta
          name="description"
          content="Social media and publishing platform!"
        />
      </Head>
      <div className="flex 2xl:justify-center">
        <NavigationSidebar isLogin={isLogin} />
        <main className="w-4/5 max-w-6xl border-l-2 border-gray-200">
          {children}
        </main>
      </div>
    </>
  );
};

export default Layout;
