import { createTRPCRouter } from "@server/api/trpc";
import searchBooks from "./searchBooks";
import searchUsers from "./searchUsers";

export const searchRouter = createTRPCRouter({
  searchUsers: searchUsers,
  searchBooks: searchBooks,
});
