import type { PropsWithChildren } from "react";
import Head from "next/head";
import NavigationSidebar from "./NavigationSidebar";
import { useRouter } from "next/router";
import type { Session } from "next-auth";
import { userInfo } from "mocks/search";

const Layout = ({
  children,
  session,
}: PropsWithChildren<{ session: Session | null }>) => {
  const router = useRouter();
  const { penname } = router.query;

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
      <div className="flex min-h-screen justify-center bg-gray-100">
        <div className="w-72">
          <NavigationSidebar session={session} />
        </div>
        <main className="w-4/5 max-w-6xl border-l-2 border-gray-200 ">
          {children}
        </main>
      </div>
    </>
  );
};

export default Layout;
