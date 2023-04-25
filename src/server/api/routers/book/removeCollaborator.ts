import { BookOwnerStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";

const removeCollaborator = protectedProcedure
  .input(z.object({ bookId: z.string().cuid(), userId: z.string().cuid() }))
  .mutation(async ({ ctx, input }) => {
    const { bookId, userId } = input;

    // check if the book exists
    const book = await ctx.prisma.book.findFirst({
      where: {
        id: bookId,
      },
      include: {
        owners: true,
      },
    });

    if (!book) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "book not found",
      });
    }

    if (
      userId === ctx.session.user.id &&
      book.owners.find(({ status }) => status === BookOwnerStatus.OWNER)!
        .userId === ctx.session.user.id
    ) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "you cannot remove yourself as an owner",
      });
    }

    await ctx.prisma.bookOwner.deleteMany({
      where: {
        bookId,
        userId,
      },
    });
  });

export default removeCollaborator;
