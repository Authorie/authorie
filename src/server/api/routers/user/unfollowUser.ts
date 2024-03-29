import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";

const unfollowUser = protectedProcedure
  .input(z.string())
  .mutation(async ({ ctx, input }) => {
    await ctx.prisma.followingFollower.delete({
      where: {
        followingId_followerId: {
          followingId: input,
          followerId: ctx.session.user.id,
        },
      },
    });
  });

export default unfollowUser;
