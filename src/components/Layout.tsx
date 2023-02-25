import type { PropsWithChildren } from "react";
import NavigationSidebar from "./Navigation/NavigationSidebar";
import { useRouter } from "next/router";

const Layout = ({ children }: PropsWithChildren) => {
  const router = useRouter();

  if (router.pathname === "/auth/new-user") {
    return <>{children}</>;
  }

  return (
    <div className="flex 2xl:justify-center">
      <NavigationSidebar />
      <main className="w-4/5 max-w-6xl border-l-2 border-gray-200 px-10 py-4">
        {children}
      </main>
    </div>
  );
};

export default Layout;
