import type { PropsWithChildren } from "react";
import Head from "next/head";
import NavigationSidebar from "./NavigationSidebar";
import { useRouter } from "next/router";
import type { Session } from "next-auth";
import UserBanner from "./UserBanner";
import { userInfo } from "mocks/search";

const Layout = ({
  children,
  session,
}: PropsWithChildren<{ session: Session | null }>) => {
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
      <div className="flex 2xl:container 2xl:mx-auto">
        <div className="w-72">
          <NavigationSidebar session={session} />
        </div>
        <main className="flex w-full flex-col items-center justify-center border-l-2 border-gray-200 bg-gray-100">
          {router.pathname === "/[penname]" && (
            <UserBanner
              penname={userInfo[0]?.penname}
              bio={userInfo[0]?.bio}
              followers={userInfo[0]?.followers}
              following={userInfo[0]?.following}
              followed={false}
            />
          )}
          {children}
        </main>
      </div>
    </>
  );
};

export default Layout;
