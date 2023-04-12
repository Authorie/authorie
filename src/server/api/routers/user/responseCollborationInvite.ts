import { BookOwnerStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";

const responseCollaborationInvite = protectedProcedure
  .input(z.object({ bookId: z.string().cuid(), accept: z.boolean() }))
  .mutation(async ({ ctx, input }) => {
    const { bookId, accept } = input;
    // check if the book exists
    const book = await ctx.prisma.book.findUnique({
      where: {
        id: bookId,
      },
    });
    if (!book) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "book not found",
      });
    }

    // check if the user is already a collaborator
    const isCollaborator = await ctx.prisma.bookOwner.findFirst({
      where: {
        bookId,
        userId: ctx.session.user.id,
        status: BookOwnerStatus.INVITEE,
      },
    });
    if (!isCollaborator) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "you are not invited to collaborate on this book",
      });
    }

    // update the book owner status
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
  });

export default responseCollaborationInvite;
