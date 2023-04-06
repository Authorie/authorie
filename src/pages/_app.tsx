import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { Analytics } from "@vercel/analytics/react";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import type { ReactElement, ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import superjson from "superjson";
import Layout from "~/components/Layout/Layout";
import { appRouter } from "~/server/api/root";
import { createInnerTRPCContext } from "~/server/api/trpc";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/utils/api";

import "~/styles/globals.css";

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getServerAuthSession(context);
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: createInnerTRPCContext({ session }),
    transformer: superjson,
  });
  if (session) {
    await ssg.user.getData.prefetch();
    if (!session.user.penname) {
      return {
        redirect: {
          destination: "/auth/new-user",
          permanent: false,
        },
      };
    }
  }

  return {
    props: {
      trpcState: ssg.dehydrate(),
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
      <Toaster />
    </SessionProvider>
  );
};

export { reportWebVitals } from "next-axiom";
export default api.withTRPC(MyApp);
