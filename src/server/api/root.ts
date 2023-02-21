import { createTRPCRouter } from "./trpc";
import { categoryRouter } from "./routers/category";
import { userRouter } from "./routers/user";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  category: categoryRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
