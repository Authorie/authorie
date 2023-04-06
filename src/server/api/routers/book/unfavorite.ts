import { protectedProcedure } from "@server/api/trpc";
import { z } from "zod";

const unfavorite = protectedProcedure
  .input(z.object({ id: z.string().cuid() }))
  .mutation(async ({ ctx, input }) => {
    await ctx.prisma.favoriteBook.delete({
      where: {
        bookId_userId: {
          bookId: input.id,
          userId: ctx.session.user.id,
        },
      },
    });
  });

export default unfavorite;
