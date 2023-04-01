import {
  BookOwnerStatus,
  NotificationActionType,
  NotificationEntityType,
} from "@prisma/client";
import { protectedProcedure } from "@server/api/trpc";
import { z } from "zod";

const responseCollaborationInvite = protectedProcedure
  .input(z.object({ bookId: z.string().cuid(), accept: z.boolean() }))
  .mutation(async ({ ctx, input }) => {
    const { bookId, accept } = input;
    // check if the book exists
    const book = await ctx.prisma.book.findUniqueOrThrow({
      where: {
        id: bookId,
      },
      include: {
        owners: {
          where: {
            status: {
              in: [BookOwnerStatus.OWNER, BookOwnerStatus.COLLABORATOR],
            },
          },
        },
      },
    });

    // check if the user is already a collaborator
    await ctx.prisma.bookOwner.findFirstOrThrow({
      where: {
        bookId,
        userId: ctx.session.user.id,
        status: BookOwnerStatus.INVITEE,
      },
    });

    // update the book owner status
    await ctx.prisma.$transaction([
      ctx.prisma.bookOwner.update({
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
      }),
      ctx.prisma.notificationObject.create({
        data: {
          entityId: bookId,
          entityType: NotificationEntityType.BOOK,
          action: accept
            ? NotificationActionType.USER_COLLAB_ACCEPT
            : NotificationActionType.USER_COLLAB_REJECT,
          actorId: ctx.session.user.id,
          viewers: {
            createMany: {
              data: book.owners.map((owner) => ({
                viewerId: owner.userId,
              })),
            },
          },
        },
      }),
    ]);
  });

export default responseCollaborationInvite;
