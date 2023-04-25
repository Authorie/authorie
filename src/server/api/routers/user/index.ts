import { createTRPCRouter } from "~/server/api/trpc";
import followUser from "./followUser";
import getUser from "./getUser";
import unfollowUser from "./unfollowUser";
import update from "./update";

export const userRouter = createTRPCRouter({
  getData: getUser,
  followUser: followUser,
  unfollowUser: unfollowUser,
  update: update,
});
