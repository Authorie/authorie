import { protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";

const isLike = protectedProcedure
  .input(z.object({ id: z.string().cuid() }))
  .query(async ({ ctx, input }) => {
    return Boolean(
      await ctx.prisma.chapterCommentLike.findFirst({
        where: {
          commentId: input.id,
          userId: ctx.session.user.id,
        },
      })
    );
  });

export default isLike;
