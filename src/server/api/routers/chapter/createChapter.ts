import type { Prisma } from "@prisma/client";
import { BookOwnerStatus, BookStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
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
          z.date().refine((date) => date.getTime() > Date.now()),
          z.boolean(),
        ])
        .nullish()
        .optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { chapterId, title, content, bookId, price, publishedAt } = input;
    if (bookId) {
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
            select: {
              userId: true,
            },
          },
        },
      });

      if (!book) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Book not found",
        });
      }

      const validBookStatus = [BookStatus.DRAFT, BookStatus.PUBLISHED];
      if (!validBookStatus.includes(book.status)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You can't add chapters to this book",
        });
      }
    } else if (publishedAt) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "You can't publish a chapter without a book",
      });
    }

    if (chapterId) {
      const chapter = await ctx.prisma.chapter.findFirst({
        where: {
          id: chapterId,
          ownerId: ctx.session.user.id,
        },
      });

      if (!chapter) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Chapter not found",
        });
      }

      if (chapter.publishedAt && chapter.publishedAt.getTime() < Date.now()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You can't update a published chapter",
        });
      }

      if (bookId && chapter.bookId && chapter.bookId !== bookId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You can't change the book of a chapter",
        });
      }

      await ctx.prisma.chapter.update({
        where: { id: chapterId },
        data: {
          title,
          content,
          bookId,
          price,
          ownerId: ctx.session.user.id,
          publishedAt:
            publishedAt === null || publishedAt === false
              ? null
              : publishedAt === true
              ? new Date()
              : publishedAt,
        },
      });
    } else {
      await ctx.prisma.chapter.create({
        data: {
          title,
          content,
          bookId,
          price,
          ownerId: ctx.session.user.id,
          publishedAt:
            publishedAt === null || publishedAt === false
              ? null
              : publishedAt === true
              ? new Date()
              : publishedAt,
        },
      });
    }
  });

export default createChapter;
