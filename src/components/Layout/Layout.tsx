import dynamic from "next/dynamic";
import Head from "next/head";
import { type PropsWithChildren } from "react";
import AuthorBannerContainer from "./AuthorBannerContainer";
import NavigationTopBar from "./NavigationTopBar";
const CreateLayout = dynamic(() => import("./CreateLayout"));
const NavigationSidebar = dynamic(() => import("./NavigationSidebar"));

const noLayoutPages = ["/auth/new-user", "/auth/signin"];

const Layout = ({
  pathname,
  children,
}: PropsWithChildren<{ pathname: string }>) => {
  const isNoLayout = noLayoutPages.includes(pathname);
  const isMainPage = pathname.includes("/main");
  const isCreatePage = pathname.includes("create");
  const isAuthorPage = pathname.includes("[penname]");

  let content = children;

  if (isNoLayout) {
    content = children;
  } else if (isMainPage) {
    content = (
      <div className="max-h-full min-h-screen">
        <NavigationTopBar pathname={pathname} />
        {children}
      </div>
    );
  } else {
    const mainClassname = `max-h-full min-h-screen grow border-l-2 border-gray-200 bg-gray-100 ${
      isCreatePage ? "" : "flex flex-col items-center"
    }`;
    content = (
      <div className="mx-auto w-screen max-w-screen-2xl">
        <div className="flex w-full">
          <div className="shrink-0 basis-60">
            <NavigationSidebar />
          </div>
          <main className={mainClassname}>
            {isAuthorPage && <AuthorBannerContainer />}
            {isCreatePage ? <CreateLayout>{children}</CreateLayout> : children}
          </main>
        </div>
      </div>
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
      {content}
    </>
  );
};

export default Layout;
