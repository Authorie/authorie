import { protectedProcedure } from "@server/api/trpc";
import { z } from "zod";

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
