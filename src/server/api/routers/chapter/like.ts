import { NotificationActionType, NotificationEntityType } from "@prisma/client";
import { protectedProcedure } from "@server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const like = protectedProcedure
  .input(z.object({ id: z.string().cuid() }))
  .mutation(async ({ ctx, input }) => {
    const chapter = await ctx.prisma.chapter.findUniqueOrThrow({
      where: {
        id: input.id,
      },
      include: {
        book: {
          select: {
            status: true,
          },
        },
      },
    });

    if (chapter.publishedAt && chapter.publishedAt.getTime() > Date.now()) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Chapter not published yet",
      });
    }

    await ctx.prisma.$transaction([
      ctx.prisma.chapterLike.upsert({
        where: {
          chapterId_userId: {
            chapterId: input.id,
            userId: ctx.session.user.id,
          },
        },
        create: {
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
        },
        update: {},
      }),
      ctx.prisma.notificationObject.create({
        data: {
          entityId: input.id,
          entityType: NotificationEntityType.CHAPTER,
          action: NotificationActionType.CHAPTER_LIKE,
          actorId: ctx.session.user.id,
          viewers: {
            create: {
              viewerId: chapter.ownerId,
            },
          },
        },
      }),
    ]);
  });

export default like;
