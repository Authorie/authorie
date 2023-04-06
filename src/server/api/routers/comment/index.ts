import { createTRPCRouter } from "~/server/api/trpc";
import createComment from "./createComment";
import getAllComments from "./getAllComments";
import isLike from "./isLike";
import like from "./like";
import unlike from "./unlike";

export const commentRouter = createTRPCRouter({
  getAll: getAllComments,
  create: createComment,
  isLike: isLike,
  like: like,
  unlike: unlike,
});
