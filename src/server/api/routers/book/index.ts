import { createTRPCRouter } from "@server/api/trpc";
import createBook from "./createBook";
import deleteBook from "./deleteBook";
import favorite from "./favorite";
import getAllBooks from "./getAllBooks";
import getBook from "./getBook";
import isFavorite from "./isFavorite";
import moveState from "./moveState";
import unfavorite from "./unfavorite";
import updateBook from "./updateBook";

export const bookRouter = createTRPCRouter({
  getData: getBook,
  getAll: getAllBooks,
  create: createBook,
  update: updateBook,
  isFavorite: isFavorite,
  favorite: favorite,
  unfavorite: unfavorite,
  moveState: moveState,
  delete: deleteBook,
});

export default bookRouter;
