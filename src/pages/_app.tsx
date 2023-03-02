import Layout from "@components/Layout/Layout";
import { useSetUser } from "@hooks/user";
import { appRouter } from "@server/api/root";
import { createInnerTRPCContext } from "@server/api/trpc";
import { getServerAuthSession } from "@server/auth";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { api } from "@utils/api";
import { Analytics } from "@vercel/analytics/react";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import type { ReactElement, ReactNode } from "react";
import superjson from "superjson";

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

  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: createInnerTRPCContext({ session }),
    transformer: superjson,
  });
  if (session?.user?.id) {
    await ssg.user.getData.prefetch(session?.user?.id);
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
  const setUser = useSetUser();
  api.user.getData.useQuery(session?.user?.penname, {
    enabled: Boolean(session?.user?.penname),
    onSuccess: (user) => {
      setUser(user);
    },
  });

  const getLayout = Component.getLayout || ((page) => commonLayout(page));

  return (
    <SessionProvider session={session}>
      {getLayout(<Component {...pageProps} />)}
      <Analytics />
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
