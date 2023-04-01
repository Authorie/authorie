import { BookOwnerStatus } from "@prisma/client";
import { protectedProcedure } from "@server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const responseCollaborationInvite = protectedProcedure
  .input(z.object({ bookId: z.string().cuid(), accept: z.boolean() }))
  .mutation(async ({ ctx, input }) => {
    const { bookId, accept } = input;
    // check if the book exists
    try {
      await ctx.prisma.book.findUniqueOrThrow({
        where: {
          id: bookId,
        },
      });
    } catch (err) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "book does not exist",
        cause: err,
      });
    }

    // check if the user is already a collaborator
    try {
      await ctx.prisma.bookOwner.findFirstOrThrow({
        where: {
          bookId,
          userId: ctx.session.user.id,
          status: BookOwnerStatus.INVITEE,
        },
      });
    } catch (err) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "you are not invited to this book",
        cause: err,
      });
    }

    // update the book owner status
    try {
      await ctx.prisma.bookOwner.update({
        where: {
          bookId_userId: {
            bookId,
            userId: ctx.session.user.id,
          },
        },
        data: {
          status: accept
            ? BookOwnerStatus.COLLABORATOR
            : BookOwnerStatus.REJECTED,
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

export default responseCollaborationInvite;
