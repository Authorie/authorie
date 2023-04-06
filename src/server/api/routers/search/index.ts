import { createTRPCRouter } from "~/server/api/trpc";
import searchBooks from "./searchBooks";
import searchChapters from "./searchChapters";
import searchUsers from "./searchUsers";

export const searchRouter = createTRPCRouter({
  searchUsers: searchUsers,
  searchBooks: searchBooks,
  searchChapters: searchChapters,
});
