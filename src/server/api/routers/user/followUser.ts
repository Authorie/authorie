import { protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";

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
