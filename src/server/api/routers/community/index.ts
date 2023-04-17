import { createTRPCRouter } from "../../trpc";
import createNewPost from "./createNewPost";
import getAllPosts from "./getAllPosts";
import getPost from "./getPost";
import toggleLikePost from "./toggleLikePost";

export const communityPostRouter = createTRPCRouter({
  createNewPost: createNewPost,
  getAllPosts: getAllPosts,
  getPost: getPost,
  toggleLikePost: toggleLikePost,
})