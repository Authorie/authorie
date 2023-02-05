import { type NextPage } from "next";
import Head from "next/head";
import { useSession } from "next-auth/react";

import user from "../mocks/user";
import NavigationSidebar from "@components/Navigation/NavigationSidebar";

const Home: NextPage = () => {
  const { data: session } = useSession();

  return (
    <>
      <Head>
        <title>Authorie</title>
      </Head>
      <main>
        <NavigationSidebar user={session ? user : undefined} />
      </main>
    </>
  );
};

export default Home;
