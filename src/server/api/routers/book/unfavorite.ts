import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";

const unfavorite = protectedProcedure
  .input(z.object({ id: z.string().cuid() }))
  .mutation(async ({ ctx, input }) => {
    await ctx.prisma.favoriteBook.deleteMany({
      where: {
        bookId: input.id,
        userId: ctx.session.user.id,
      },
    });
  });

export default unfavorite;
