import NavigationSidebar from "./Navigation/NavigationSidebar";
import type { User } from "next-auth";
import { useRouter } from "next/router";

type props = {
  children: JSX.Element;
  user: User | undefined;
};

const Layout = ({ children, user }: props) => {
  const router = useRouter();
  return (
    <div className="flex justify-center">
      {router.pathname != "/new-user" && <NavigationSidebar user={user} />}
      <main className="w-4/5 max-w-6xl px-10 py-4">{children}</main>
    </div>
  );
};

export default Layout;
