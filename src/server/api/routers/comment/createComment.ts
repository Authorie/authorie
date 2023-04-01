import {
  BookStatus,
  NotificationActionType,
  NotificationEntityType,
} from "@prisma/client";
import { protectedProcedure } from "@server/api/trpc";
import { z } from "zod";

const createComment = protectedProcedure
  .input(
    z.object({
      id: z.string().cuid(),
      image: z.string().url().optional(),
      content: z.string(),
      parent: z.string().cuid().optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const chapter = await ctx.prisma.chapter.findFirstOrThrow({
      where: {
        id: input.id,
        book: {
          status: {
            in: [
              BookStatus.PUBLISHED,
              BookStatus.COMPLETED,
              BookStatus.ARCHIVED,
            ],
          },
        },
        publishedAt: {
          lte: new Date(),
        },
      },
      include: { book: true },
    });

    const parentComment = input.parent
      ? await ctx.prisma.chapterComment.findUniqueOrThrow({
          where: {
            id: input.parent,
          },
        })
      : undefined;

    ctx.prisma.$transaction(async (tx) => {
      await tx.chapterComment.create({
        data: {
          image: input.image,
          content: input.content,
          chapter: {
            connect: {
              id: input.id,
            },
          },
          user: {
            connect: {
              id: ctx.session.user.id,
            },
          },
          parent: input.parent
            ? {
                connect: {
                  id: input.parent,
                },
              }
            : undefined,
        },
      });

      await tx.notificationObject.create({
        data: {
          entityId: input.id,
          entityType: NotificationEntityType.CHAPTER,
          action: NotificationActionType.CHAPTER_COMMENT,
          actorId: ctx.session.user.id,
          viewers: {
            create: {
              viewerId: chapter.ownerId,
            },
          },
        },
      });

      if (parentComment) {
        await tx.notificationObject.create({
          data: {
            entityId: parentComment.id,
            entityType: NotificationEntityType.COMMENT,
            action: NotificationActionType.COMMENT_REPLY,
            actorId: ctx.session.user.id,
            viewers: {
              create: {
                viewerId: parentComment.userId,
              },
            },
          },
        });
      }
    });
  });

export default createComment;
