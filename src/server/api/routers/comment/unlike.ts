import { protectedProcedure } from "@server/api/trpc";
import { z } from "zod";

const unlike = protectedProcedure
  .input(z.object({ id: z.string().cuid() }))
  .mutation(async ({ ctx, input }) => {
    await ctx.prisma.chapterCommentLike.delete({
      where: {
        commentId_userId: {
          commentId: input.id,
          userId: ctx.session.user.id,
        },
      },
    });
  });

export default unlike;
