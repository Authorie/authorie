import { createTRPCRouter } from "~/server/api/trpc";
import createBook from "./createBook";
import deleteBook from "./deleteBook";
import favorite from "./favorite";
import getAllBooks from "./getAllBooks";
import getBook from "./getBook";
import inviteCollaborator from "./inviteCollaborator";
import moveState from "./moveState";
import removeCollaborator from "./removeCollaborator";
import responseCollaborationInvite from "./responseCollborationInvite";
import unfavorite from "./unfavorite";
import updateBook from "./updateBook";

export const bookRouter = createTRPCRouter({
  getData: getBook,
  getAll: getAllBooks,
  create: createBook,
  update: updateBook,
  favorite: favorite,
  unfavorite: unfavorite,
  moveState: moveState,
  delete: deleteBook,
  inviteCollaborator: inviteCollaborator,
  responseCollaborationInvite: responseCollaborationInvite,
  removeCollaborator: removeCollaborator,
});

export default bookRouter;
