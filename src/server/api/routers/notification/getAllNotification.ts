import { NotificationEntityType } from "@prisma/client";
import { protectedProcedure } from "@server/api/trpc";
import { makePagination } from "@server/utils";
import { z } from "zod";

const getAllNotification = protectedProcedure
  .input(
    z.object({
      limit: z.number().int().min(1).max(100).default(10),
      cursor: z.string().cuid().optional(),
    })
  )
  .query(async ({ ctx, input }) => {
    const { limit, cursor } = input;
    const notifications = await ctx.prisma.notification.findMany({
      where: {
        viewerId: ctx.session.user.id,
      },
      include: {
        notificationObject: {
          include: {
            actors: {
              include: {
                actor: {
                  select: {
                    id: true,
                    penname: true,
                    image: true,
                  },
                },
              },
            },
          },
        },
      },
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const bookIds = new Set<string>();
    const userIds = new Set<string>();
    const commentIds = new Set<string>();
    const chapterIds = new Set<string>();
    for (const n of notifications) {
      switch (n.notificationObject.entityType) {
        case NotificationEntityType.BOOK:
          bookIds.add(n.notificationObject.entityId);
          break;
        case NotificationEntityType.USER:
          userIds.add(n.notificationObject.entityId);
          break;
        case NotificationEntityType.COMMENT:
          commentIds.add(n.notificationObject.entityId);
          break;
        case NotificationEntityType.CHAPTER:
          chapterIds.add(n.notificationObject.entityId);
          break;
        default:
          break;
      }
    }

    return {
      ...makePagination(notifications, limit),
      bookIds,
      userIds,
      commentIds,
      chapterIds,
    };
  });

export default getAllNotification;
