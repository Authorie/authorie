import { api } from "@utils/api";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useRouter } from "next/router";
import type { PropsWithChildren } from "react";
import NavigationTopBar from "./NavigationTopBar";
const AuthorBanner = dynamic(() => import("./AuthorBanner"));
const CreateLayout = dynamic(() => import("./CreateLayout"));
const NavigationSidebar = dynamic(() => import("./NavigationSidebar"));

const NoLayoutPaths = ["/auth/new-user", "/auth/signin"];

const Layout = ({ children }: PropsWithChildren) => {
  const router = useRouter();
  const { status } = useSession();
  const { data: userFromBanner } = api.user.getData.useQuery(
    router.query.penname as string,
    {
      enabled: router.query.penname !== undefined,
    }
  );
  const { data: userFromSession } = api.user.getData.useQuery(undefined, {
    enabled: status === "authenticated",
  });

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

  if (
    router.pathname.includes("/main/home") ||
    router.pathname.includes("/main/report")
  ) {
    return (
      <>
        <Head>
          <title>Authorie</title>
          <meta
            name="description"
            content="Social media and publishing platform!"
          />
        </Head>
        <div className="h-screen">
          <NavigationTopBar />
          {children}
        </div>
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
      <div className="mx-auto w-screen max-w-screen-2xl">
        <div className="flex w-full">
          <div className="shrink-0 basis-60">
            <NavigationSidebar user={userFromSession} />
          </div>
          <main
            className={`max-h-full min-h-screen grow border-l-2 border-gray-200 bg-gray-100 ${
              router.pathname.includes("create")
                ? ""
                : "flex flex-col items-center"
            }`}
          >
            {router.pathname.includes("[penname]") && (
              <AuthorBanner
                user={userFromBanner}
                penname={router.query.penname as string}
              />
            )}
            {router.pathname.includes("create") ? (
              <CreateLayout>{children}</CreateLayout>
            ) : (
              children
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default Layout;
