import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import FacebookProvider from "next-auth/providers/facebook";
import GoogleProvider from "next-auth/providers/google";
import { env } from "~/env.mjs";
import { prisma } from "~/server/db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: User & DefaultSession["user"];
  }
  interface User {
    id: string;
    penname: string | null;
    coin: number;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  // Include user.id on session
  callbacks: {
    session({ session, user }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
          coin: user.coin,
          image: user.image,
          penname: user.penname,
        }
      }
    },
  },
  // Configure one or more authentication providers
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "login",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    FacebookProvider({
      clientId: env.FACEBOOK_CLIENT_ID,
      clientSecret: env.FACEBOOK_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  debug: env.NODE_ENV !== "production",
  useSecureCookies: env.NODE_ENV === "production",
  pages: { newUser: "/auth/new-user", signIn: "/auth/signin" },
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *import { GoogleProvider } from 'next-auth/providers/google';

 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = ({
  req,
  res,
}: CreateNextContextOptions) => {
  return getServerSession(req, res, authOptions);
};
