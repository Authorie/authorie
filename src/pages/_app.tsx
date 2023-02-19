import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { getServerAuthSession } from "@server/auth";
import { type GetServerSidePropsContext } from "next";

import { api } from "@utils/api";

import "../styles/globals.css";

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getServerAuthSession(context);
  if (session?.user && !session.user.penname) {
    return {
      redirect: {
        destination: "/auth/new-user",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
