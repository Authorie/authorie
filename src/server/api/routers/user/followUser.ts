import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";

const followUser = protectedProcedure
  .input(z.string())
  .mutation(async ({ ctx, input }) => {
    await ctx.prisma.followingFollower.create({
      data: {
        follower: {
          connect: {
            id: ctx.session.user.id,
          },
        },
        following: {
          connect: {
            id: input,
          },
        },
      },
    });
  });

export default followUser;
