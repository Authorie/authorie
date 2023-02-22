import { createTRPCRouter } from "./trpc";
import { categoryRouter } from "./routers/category";
import { userRouter } from "./routers/user";
import { searchRouter } from "./routers/search";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  search: searchRouter,
  category: categoryRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
