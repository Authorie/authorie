import { protectedProcedure } from "@server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const isLike = protectedProcedure
  .input(z.object({ id: z.string().cuid() }))
  .query(async ({ ctx, input }) => {
    try {
      return !!(await ctx.prisma.chapterCommentLike.findFirst({
        where: {
          commentId: input.id,
          userId: ctx.session.user.id,
        },
      }));
    } catch (err) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "failed to check comment like",
        cause: err,
      });
    }
  });

export default isLike;
