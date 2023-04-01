import { protectedProcedure } from "@server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const favorite = protectedProcedure
  .input(z.object({ id: z.string().cuid() }))
  .mutation(async ({ ctx, input }) => {
    try {
      await ctx.prisma.favoriteBook.create({
        data: {
          bookId: input.id,
          userId: ctx.session.user.id,
        },
      });
    } catch (err) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "failed to favorite",
        cause: err,
      });
    }
  });

export default favorite;
