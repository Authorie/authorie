import { type NextPage } from "next";
import Head from "next/head";

import NavigationSidebar from "../components/Navigation/NavigationSidebar";

import user from "../mocks/user";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Authorie</title>
      </Head>
      <main>
        <NavigationSidebar
          username={user.username}
          profileImage={user.profileImage}
          coin={user.coin}
        />
      </main>
    </>
  );
};

export default Home;
