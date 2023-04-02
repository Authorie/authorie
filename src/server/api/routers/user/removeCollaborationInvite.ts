import { BookOwnerStatus } from "@prisma/client";
import { protectedProcedure } from "@server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const removeCollaborationInvite = protectedProcedure
  .input(z.object({ bookId: z.string().cuid(), userId: z.string().cuid() }))
  .mutation(async ({ ctx, input }) => {
    const { bookId, userId } = input;

    // check if the book exists
    const book = await ctx.prisma.book.findFirst({
      where: {
        id: bookId,
        owners: {
          some: {
            userId: ctx.session.user.id,
            status: BookOwnerStatus.OWNER,
          },
        },
      },
      include: {
        owners: {
          where: {
            status: {
              in: [BookOwnerStatus.INVITEE, BookOwnerStatus.COLLABORATOR],
            },
          },
        },
      },
    });

    if (!book) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "book not found",
      });
    }

    if (userId === ctx.session.user.id) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "you cannot remove yourself",
      });
    }

    if (!book.owners.find((owner) => owner.userId === userId)) {
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
