import { BookOwnerStatus, BookStatus } from "@prisma/client";
import { protectedProcedure } from "@server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const deleteBook = protectedProcedure
  .input(z.object({ id: z.string().cuid() }))
  .mutation(async ({ ctx, input }) => {
    const { id } = input;
    const book = await ctx.prisma.book.findFirst({
      where: {
        id: input.id,
        owners: {
          some: { userId: ctx.session.user.id, status: BookOwnerStatus.OWNER },
        },
      },
    });

    if (!book) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "book not found",
      });
    }

    const validBookStatus = [BookStatus.INITIAL, BookStatus.DRAFT];
    if (!validBookStatus.includes(book.status)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "book cannot be deleted",
      });
    }

    await ctx.prisma.book.delete({
      where: { id },
    });
  });

export default deleteBook;
