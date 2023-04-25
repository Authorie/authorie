import { createTRPCRouter } from "~/server/api/trpc";
import followUser from "./followUser";
import getFollowers from "./getFollowers";
import getFollowingUsers from "./getFollowingUsers";
import getUser from "./getUser";
import isFollowUser from "./isFollowUser";
import unfollowUser from "./unfollowUser";
import update from "./update";

export const userRouter = createTRPCRouter({
  getData: getUser,
  getFollowing: getFollowingUsers,
  getFollowers: getFollowers,
  followUser: followUser,
  unfollowUser: unfollowUser,
  isFollowUser: isFollowUser,
  update: update,
});
