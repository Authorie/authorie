import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import type { Session } from "next-auth";
import superjson from "superjson";
import { appRouter } from "./api/root";
import { createInnerTRPCContext } from "./api/trpc";

interface paginationItem {
  id: string;
}

export function makePagination<T extends paginationItem>(
  items: T[],
  limit: number
): {
  items: T[];
  nextCursor?: string;
} {
  let nextCursor: string | undefined = undefined;
  if (items.length > limit) {
    const nextItem = items.pop();
    nextCursor = nextItem?.id;
  }

  return {
    items,
    nextCursor,
  };
}

export const generateSSGHelper = (session: Session | null) =>
  createProxySSGHelpers({
    router: appRouter,
    ctx: createInnerTRPCContext({ session }),
    transformer: superjson, // optional - adds superjson serialization
  });
