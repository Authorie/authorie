import { protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";

const isFavorite = protectedProcedure
  .input(z.object({ id: z.string().cuid() }))
  .query(async ({ ctx, input }) => {
    return Boolean(
      await ctx.prisma.favoriteBook.findUnique({
        where: {
          bookId_userId: {
            bookId: input.id,
            userId: ctx.session.user.id,
          },
        },
      })
    );
  });

export default isFavorite;
