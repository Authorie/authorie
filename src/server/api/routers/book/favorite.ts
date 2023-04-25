import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";

const favorite = protectedProcedure
  .input(z.object({ id: z.string().cuid() }))
  .mutation(async ({ ctx, input }) => {
    await ctx.prisma.favoriteBook.upsert({
      where: {
        bookId_userId: {
          bookId: input.id,
          userId: ctx.session.user.id,
        },
      },
      create: {
        bookId: input.id,
        userId: ctx.session.user.id,
      },
      update: {},
    });
  });

export default favorite;
