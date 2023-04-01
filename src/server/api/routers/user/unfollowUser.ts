import { Prisma } from "@prisma/client";
import { protectedProcedure } from "@server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const unfollowUser = protectedProcedure
  .input(z.object({ id: z.string().cuid() }))
  .mutation(async ({ ctx, input }) => {
    const { id } = input;
    try {
      await ctx.prisma.followingFollower.delete({
        where: {
          followingId_followerId: {
            followingId: id,
            followerId: ctx.session.user.id,
          },
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2002") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `user does not exist: ${id}`,
            cause: e,
          });
        }
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `you are already following ${id}`,
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
