import type { Prisma } from "@prisma/client";
import { BookOwnerStatus, BookStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import dayjs from "dayjs";
import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";

const createChapter = protectedProcedure
  .input(
    z.object({
      chapterId: z.string().cuid().optional(),
      title: z.string(),
      content: z.unknown().transform((v) => v as Prisma.JsonObject),
      bookId: z.string().cuid().optional(),
      price: z.number().int().min(0).optional(),
      publishedAt: z
        .union([
          z.date().refine((date) => dayjs().isAfter(date), {
            message: "Published date must be in the future",
          }),
          z.boolean(),
        ])
        .nullable()
        .default(null),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { chapterId, title, content, bookId, price } = input;
    const publishedAt =
      input.publishedAt === null || input.publishedAt === false
        ? null
        : input.publishedAt === true
          ? dayjs().toDate()
          : input.publishedAt;
    if (bookId) {
      await ctx.prisma.book.findFirstOrThrow({
        where: {
          id: bookId,
          status: {
            in: [BookStatus.DRAFT, BookStatus.PUBLISHED],
          },
          owners: {
            some: {
              userId: ctx.session.user.id,
              status: {
                in: [BookOwnerStatus.OWNER, BookOwnerStatus.COLLABORATOR],
              },
            },
          },
        },
        include: {
          owners: {
            select: {
              userId: true,
            },
          },
        },
      });
    } else if (publishedAt) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "You can't publish a chapter without a book",
      });
    }

    const chapterNo = publishedAt
      ? (await ctx.prisma.chapter.count({
        where: {
          bookId,
          publishedAt: {
            lte: publishedAt,
          },
        },
      })) + 1
      : undefined;

    if (chapterId) {
      const chapter = await ctx.prisma.chapter.findFirstOrThrow({
        where: {
          id: chapterId,
          ownerId: ctx.session.user.id,
        },
      });

      if (bookId && chapter.bookId && chapter.bookId !== bookId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You can't change the book of a chapter",
        });
      }

      return await ctx.prisma.chapter.update({
        where: { id: chapterId },
        data: {
          title,
          content,
          bookId,
          price,
          chapterNo,
          publishedAt,
          ownerId: ctx.session.user.id,
        },
      });
    } else {
      return await ctx.prisma.chapter.create({
        data: {
          title,
          content,
          bookId,
          price,
          chapterNo,
          publishedAt,
          ownerId: ctx.session.user.id,
        },
      });
    }
  });

export default createChapter;
