import { Analytics } from "@vercel/analytics/react";
import type { NextPage } from "next";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import type { ReactElement, ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import Layout from "~/components/Layout/Layout";
import { api } from "~/utils/api";
import Head from "next/head";
import { useRouter } from "next/router";
import "~/styles/globals.css";

export type NextPageWithLayout<P = object, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps<{ session: Session | null }> & {
  Component: NextPageWithLayout;
};

const commonLayout = (pathname: string, page: ReactNode) => {
  return <Layout pathname={pathname}>{page}</Layout>;
};

const MyApp = ({
  Component,
  pageProps: { session, ...pageProps },
}: AppPropsWithLayout) => {
  const router = useRouter();
  const getLayout =
    Component.getLayout || ((page) => commonLayout(router.pathname, page));

  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#4a4a4a" />
      </Head>
      <SessionProvider session={session}>
        {getLayout(<Component {...pageProps} />)}
        <Analytics />
        <Toaster />
      </SessionProvider>
    </>
  );
};

export { reportWebVitals } from "next-axiom";
export default api.withTRPC(MyApp);
