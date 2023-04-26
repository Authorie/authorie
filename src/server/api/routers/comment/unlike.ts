import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";

const unlike = protectedProcedure
  .input(z.object({ id: z.string().cuid() }))
  .mutation(async ({ ctx, input }) => {
    await ctx.prisma.chapterCommentLike.deleteMany({
      where: {
        commentId: input.id,
        userId: ctx.session.user.id,
      },
    });
  });

export default unlike;
