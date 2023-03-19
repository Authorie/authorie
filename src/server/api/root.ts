import { bookRouter } from "./routers/book";
import { categoryRouter } from "./routers/category";
import { chapterRouter } from "./routers/chapter";
import { commentRouter } from "./routers/comment";
import { searchRouter } from "./routers/search";
import { uploadRouter } from "./routers/upload";
import { userRouter } from "./routers/user";
import { createTRPCRouter } from "./trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  book: bookRouter,
  upload: uploadRouter,
  search: searchRouter,
  comment: commentRouter,
  chapter: chapterRouter,
  category: categoryRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
