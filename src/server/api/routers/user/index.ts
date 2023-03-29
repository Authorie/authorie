import { createTRPCRouter } from "@server/api/trpc";
import followUser from "./followUser";
import getBookCollaborators from "./getBookCollaborators";
import getFollowers from "./getFollowers";
import getFollowingUsers from "./getFollowingUsers";
import getUser from "./getUser";
import inviteCollaborator from "./inviteCollaborator";
import isFollowUser from "./isFollowUser";
import removeCollaborationInvite from "./removeCollaborationInvite";
import responseCollaborationInvite from "./responseCollborationInvite";
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
  getBookCollaborators: getBookCollaborators,
  inviteCollaborator: inviteCollaborator,
  responseCollaborationInvite: responseCollaborationInvite,
  removeCollaborationInvite: removeCollaborationInvite,
});
