import { protectedProcedure } from "@server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const isFollowUser = protectedProcedure
  .input(z.string())
  .query(async ({ ctx, input }) => {
    try {
      const following = await ctx.prisma.followingFollower.findFirst({
        where: {
          followerId: ctx.session.user.id,
          following: {
            penname: input,
          },
        },
      });
      return Boolean(following);
    } catch (e) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "something went wrong",
        cause: e,
      });
    }
  });

export default isFollowUser;
