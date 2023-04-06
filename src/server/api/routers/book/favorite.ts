import { protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";

const favorite = protectedProcedure
  .input(z.object({ id: z.string().cuid() }))
  .mutation(async ({ ctx, input }) => {
    await ctx.prisma.favoriteBook.create({
      data: {
        bookId: input.id,
        userId: ctx.session.user.id,
      },
    });
  });

export default favorite;
