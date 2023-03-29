import { BookOwnerStatus, BookStatus } from "@prisma/client";
import { protectedProcedure } from "@server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const deleteBook = protectedProcedure
  .input(z.object({ id: z.string().cuid() }))
  .mutation(async ({ ctx, input }) => {
    const { id } = input;
    let book;
    try {
      book = await ctx.prisma.book.findUniqueOrThrow({
        where: { id: input.id },
        include: {
          owners: {
            where: {
              userId: ctx.session.user.id,
              status: BookOwnerStatus.OWNER,
            },
          },
        },
      });
    } catch (err) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "book not found",
        cause: err,
      });
    }

    if (book.owners.length === 0) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "you are not owner of this book",
      });
    }

    const validBookStatus = [BookStatus.INITIAL, BookStatus.DRAFT];
    if (!validBookStatus.includes(book.status)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "book cannot be deleted",
      });
    }

    try {
      await ctx.prisma.book.delete({
        where: { id },
      });
    } catch (err) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "failed to delete book",
        cause: err,
      });
    }
  });

export default deleteBook;
