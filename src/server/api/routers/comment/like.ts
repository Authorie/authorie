import { protectedProcedure } from "@server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const like = protectedProcedure
  .input(z.object({ id: z.string().cuid() }))
  .mutation(async ({ ctx, input }) => {
    try {
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
    } catch (err) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "failed to like comment",
        cause: err,
      });
    }
  });

export default like;
