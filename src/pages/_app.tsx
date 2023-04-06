import { Analytics } from "@vercel/analytics/react";
import type { NextPage } from "next";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import type { ReactElement, ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import Layout from "~/components/Layout/Layout";
import { api } from "~/utils/api";

import "~/styles/globals.css";

export type NextPageWithLayout<P = object, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps<{ session: Session | null }> & {
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
      <Toaster />
    </SessionProvider>
  );
};

export { reportWebVitals } from "next-axiom";
export default api.withTRPC(MyApp);
