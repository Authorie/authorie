import { createTRPCRouter } from "~/server/api/trpc";
import createComment from "./createComment";
import getAllComments from "./getAllComments";
import getComment from "./getComment";
import like from "./like";
import unlike from "./unlike";

export const commentRouter = createTRPCRouter({
  getData: getComment,
  getAll: getAllComments,
  create: createComment,
  like: like,
  unlike: unlike,
});
