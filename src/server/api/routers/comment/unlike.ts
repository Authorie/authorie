import { protectedProcedure } from "@server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const unlike = protectedProcedure
  .input(z.object({ id: z.string().cuid() }))
  .mutation(async ({ ctx, input }) => {
    try {
      await ctx.prisma.chapterCommentLike.delete({
        where: {
          commentId_userId: {
            commentId: input.id,
            userId: ctx.session.user.id,
          },
        },
      });
    } catch (err) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "failed to unlike comment",
        cause: err,
      });
    }
  });

export default unlike;
