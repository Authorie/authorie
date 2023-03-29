import { BookOwnerStatus } from "@prisma/client";
import { protectedProcedure } from "@server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const removeCollaborationInvite = protectedProcedure
  .input(z.object({ bookId: z.string().cuid(), userId: z.string().cuid() }))
  .mutation(async ({ ctx, input }) => {
    const { bookId, userId } = input;

    // check if the book exists
    let book;
    try {
      book = await ctx.prisma.book.findUniqueOrThrow({
        where: {
          id: bookId,
        },
        include: {
          owners: true,
        },
      });
    } catch (err) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "book does not exist",
        cause: err,
      });
    }

    if (userId === ctx.session.user.id) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "you cannot remove yourself",
      });
    }

    // check if the user is the owner of the book
    if (
      !book.owners.some(
        (owner) =>
          owner.userId === ctx.session.user.id &&
          owner.status === BookOwnerStatus.OWNER
      )
    ) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "you are not the owner of this book",
      });
    }

    if (book.owners.find((owner) => owner.userId === userId)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "user is not a collaborator / invitee",
      });
    }

    // delete the book owner
    try {
      await ctx.prisma.bookOwner.delete({
        where: {
          bookId_userId: {
            bookId,
            userId,
          },
        },
      });
    } catch (err) {
      console.error(err);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "something went wrong",
        cause: err,
      });
    }
  });

export default removeCollaborationInvite;
