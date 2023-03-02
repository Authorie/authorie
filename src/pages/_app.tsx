import type {
  InferGetServerSidePropsType,
  GetServerSidePropsContext,
  NextPage,
} from "next";
import type { AppProps } from "next/app";
import type { ReactNode, ReactElement } from "react";
import { SessionProvider } from "next-auth/react";
import { Analytics } from "@vercel/analytics/react";

import { api } from "@utils/api";
import Layout from "@components/Layout/Layout";
import { getServerAuthSession } from "@server/auth";

import "../styles/globals.css";

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getServerAuthSession(context);
  if (session?.user && !session.user?.penname) {
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

export type NextPageWithLayout<P = object, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps<
  InferGetServerSidePropsType<typeof getServerSideProps>
> & {
  Component: NextPageWithLayout;
};

const commonLayout = (page: ReactNode) => {
  return <Layout>{page}</Layout>;
};

const MyApp = ({
  Component,
  pageProps: { session, ...pageProps },
}: AppPropsWithLayout) => {
  const getLayout = Component.getLayout || ((page) => commonLayout(page));

  return (
    <SessionProvider session={session}>
      {getLayout(<Component {...pageProps} />)}
      <Analytics />
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
