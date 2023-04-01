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
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: {
        notificationObject: {
          createdAt: "desc",
        },
      },
    });

    const bookIds = new Set<string>();
    const commentIds = new Set<string>();
    const chapterIds = new Set<string>();
    for (const n of notifications) {
      if (!n.notificationObject.entityType || !n.notificationObject.entityId)
        continue;
      switch (n.notificationObject.entityType) {
        case NotificationEntityType.BOOK:
          bookIds.add(n.notificationObject.entityId);
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

    const [books, comments, chapters] = await Promise.all([
      ctx.prisma.book.findMany({
        where: {
          id: {
            in: [...bookIds],
          },
        },
        select: {
          id: true,
          title: true,
          coverImage: true,
        },
      }),
      ctx.prisma.chapterComment.findMany({
        where: {
          id: {
            in: [...commentIds],
          },
        },
        select: {
          id: true,
          parentCommentId: true,
          chapter: {
            select: {
              id: true,
              title: true,
              book: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
      }),
      ctx.prisma.chapter.findMany({
        where: {
          id: {
            in: [...chapterIds],
          },
        },
        select: {
          id: true,
          title: true,
          book: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      }),
    ]);

    return {
      ...makePagination(notifications, limit),
      books,
      comments,
      chapters,
    };
  });

export default getAllNotification;
