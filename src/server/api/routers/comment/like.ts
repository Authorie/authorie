import { protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";

const like = protectedProcedure
  .input(z.object({ id: z.string().cuid() }))
  .mutation(async ({ ctx, input }) => {
    await ctx.prisma.chapterCommentLike.upsert({
      where: {
        commentId_userId: {
          commentId: input.id,
          userId: ctx.session.user.id,
        },
      },
      create: {
        comment: {
          connect: {
            id: input.id,
          },
        },
        user: {
          connect: {
            id: ctx.session.user.id,
          },
        },
      },
      update: {},
    });
  });

export default like;
