import { users } from "mocks/users";
import Head from "next/head";
import { useRouter } from "next/router";
import type { PropsWithChildren } from "react";
import NavigationSidebar from "./NavigationSidebar";
import UserBanner, { parseUserTab } from "./UserBanner";

const Layout = ({ children }: PropsWithChildren) => {
  const router = useRouter();
  const userInfo = users[0];

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
          <NavigationSidebar />
        </div>
        <main className="flex min-h-screen w-full flex-col items-center border-l-2 border-gray-200 bg-gray-100">
          {router.pathname.includes("[penname]") && (
            <UserBanner
              penname={userInfo.penname}
              bio={userInfo.bio}
              followers={userInfo.followers}
              following={userInfo.following}
              followed={false}
              tab={parseUserTab(router.pathname.split("/")[2])}
            />
          )}
          {children}
        </main>
      </div>
    </>
  );
};

export default Layout;
