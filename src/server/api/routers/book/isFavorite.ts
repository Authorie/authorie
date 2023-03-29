import { protectedProcedure } from "@server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const isFavorite = protectedProcedure
  .input(z.object({ id: z.string().cuid() }))
  .query(async ({ ctx, input }) => {
    try {
      const favorite = await ctx.prisma.favoriteBook.findUnique({
        where: {
          bookId_userId: {
            bookId: input.id,
            userId: ctx.session.user.id,
          },
        },
      });
      return favorite !== null;
    } catch (err) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "failed to check favorite",
        cause: err,
      });
    }
  });

export default isFavorite;
