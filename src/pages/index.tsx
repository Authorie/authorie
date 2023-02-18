import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useSession } from "next-auth/react";
import user from "../mocks/user";
import { getServerAuthSession } from "@server/auth";
import NavigationSidebar from "@components/Navigation/NavigationSidebar";
import FeedLayout from "@components/Feed/FeedLayout";

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
        <meta
          name="description"
          content="Social media and publishing platform!"
        />
      </Head>
      <div className="flex justify-center">
        <NavigationSidebar
          user={
            session?.user && {
              username: user.username,
              coin: session.user.coin,
              profileImage: user.profileImage,
            }
          }
        />
        <div className="border-l-2 px-10">
          <FeedLayout />
        </div>
      </div>
    </>
  );
};

export default Home;
