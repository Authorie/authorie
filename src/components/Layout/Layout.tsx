import { api } from "@utils/api";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import type { PropsWithChildren } from "react";
import NavigationSidebar from "./NavigationSidebar";
import UserBanner from "./UserBanner";

const NoLayoutPaths = ["/auth/new-user", "/auth/signin"];

const Layout = ({ children }: PropsWithChildren) => {
  const router = useRouter();
  const { data: session } = useSession();
  const { data: user } = api.user.getData.useQuery(
    router.query.penname as string | undefined,
    {
      enabled: Boolean(session),
    }
  );

  if (NoLayoutPaths.includes(router.pathname)) {
    return (
      <>
        <Head>
          <title>Authorie</title>
          <meta
            name="description"
            content="Social media and publishing platform!"
          />
        </Head>
        {children}
      </>
    );
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
          <NavigationSidebar user={user} />
        </div>
        <main className="flex min-h-screen w-full flex-col items-center border-l-2 border-gray-200 bg-gray-100">
          {router.pathname.includes("[penname]") && (
            <UserBanner user={user} penname={router.query.penname as string} />
          )}
          {children}
        </main>
      </div>
    </>
  );
};

export default Layout;
