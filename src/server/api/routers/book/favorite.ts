import {
  BookOwnerStatus,
  NotificationActionType,
  NotificationEntityType,
} from "@prisma/client";
import { protectedProcedure } from "@server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const favorite = protectedProcedure
  .input(z.object({ id: z.string().cuid() }))
  .mutation(async ({ ctx, input }) => {
    const { id } = input;
    const bookContributors = await ctx.prisma.bookOwner.findMany({
      where: {
        bookId: id,
        status: {
          in: [BookOwnerStatus.OWNER, BookOwnerStatus.COLLABORATOR],
        },
      },
    });
    if (bookContributors.length === 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `book does not exist: ${id}`,
      });
    }

    await ctx.prisma.$transaction([
      ctx.prisma.favoriteBook.create({
        data: {
          bookId: id,
          userId: ctx.session.user.id,
        },
      }),
      ctx.prisma.notificationObject.create({
        data: {
          entityId: id,
          entityType: NotificationEntityType.BOOK,
          action: NotificationActionType.BOOK_FAVORITE,
          actorId: ctx.session.user.id,
          viewers: {
            createMany: {
              data: bookContributors.map((contributor) => ({
                viewerId: contributor.userId,
              })),
            },
          },
        },
      }),
    ]);
  });

export default favorite;
