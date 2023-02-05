import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useSession } from "next-auth/react";

import user from "../mocks/user";
import { getServerAuthSession } from "@server/auth";
import NavigationSidebar from "@components/Navigation/NavigationSidebar";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerAuthSession(context);
  return {
    props: { session },
  };
};

const Home: NextPage = () => {
  const { data: session } = useSession();

  return (
    <>
      <Head>
        <title>Authorie</title>
      </Head>
      <main>
        <NavigationSidebar
          user={
            session?.user && {
              username: user.username,
              coin: session.user.coin,
              profileImage: user.profileImage,
            }
          }
        />
      </main>
    </>
  );
};

export default Home;
