import { createTRPCRouter } from "~/server/api/trpc";
import followCategory from "./followCategory";
import getAllCategories from "./getAllCategories";
import unfollowCategory from "./unfollowCategory";

export const categoryRouter = createTRPCRouter({
  getAll: getAllCategories,
  follow: followCategory,
  unfollow: unfollowCategory,
});
