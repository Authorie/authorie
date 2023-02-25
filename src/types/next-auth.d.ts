import { type DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user?: User & DefaultSession["user"];
  }
  interface User {
    id: string;
    penname?: string;
    coin: number;
  }
}
