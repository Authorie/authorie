import type { PropsWithChildren } from "react";
import Head from "next/head";
import NavigationSidebar from "./NavigationSidebar";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import UserBanner, { parseUserTab } from "./UserBanner";
import { userInfo } from "mocks/search";

const Layout = ({ children }: PropsWithChildren) => {
  const { data: session } = useSession();
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
        <main className="flex min-h-screen w-full flex-col items-center border-l-2 border-gray-200 bg-gray-100">
          {router.pathname.includes("[penname]") && (
            <UserBanner
              penname={userInfo[0]?.penname}
              bio={userInfo[0]?.bio}
              followers={userInfo[0]?.followers}
              following={userInfo[0]?.following}
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
