import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";

const isFollowUser = protectedProcedure
  .input(z.string())
  .query(async ({ ctx, input }) => {
    return Boolean(
      await ctx.prisma.followingFollower.findFirst({
        where: {
          followerId: ctx.session.user.id,
          following: {
            penname: input,
          },
        },
      })
    );
  });

export default isFollowUser;
