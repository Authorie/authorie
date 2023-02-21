import type {
  InferGetServerSidePropsType,
  GetServerSidePropsContext,
} from "next";
import { type AppType } from "next/app";
import { SessionProvider } from "next-auth/react";
import { getServerAuthSession } from "@server/auth";

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
    props: {
      session,
    },
  };
};

const MyApp: AppType<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ Component, pageProps: { session, ...pageProps } }) => {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
