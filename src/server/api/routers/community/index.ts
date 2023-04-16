import { createTRPCRouter } from "../../trpc";
import createNewPost from "./craeteNewPost";
import getAllPosts from "./getAllPosts";

export const communityPostRouter = createTRPCRouter({
  createNewPost: createNewPost,
  getAllPosts: getAllPosts,
})