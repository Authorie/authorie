import { Prisma } from "@prisma/client";
import { protectedProcedure } from "@server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const unfollowUser = protectedProcedure
  .input(z.string())
  .mutation(async ({ ctx, input }) => {
    try {
      await ctx.prisma.followingFollower.delete({
        where: {
          followingId_followerId: {
            followingId: input,
            followerId: ctx.session.user.id,
          },
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2002") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `user does not exist: ${input}`,
            cause: e,
          });
        }
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `you are already following ${input}`,
          cause: e,
        });
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "something went wrong",
        cause: e,
      });
    }
  });

export default unfollowUser;
