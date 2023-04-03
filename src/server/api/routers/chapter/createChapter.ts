import type { Prisma } from "@prisma/client";
import { BookOwnerStatus, BookStatus } from "@prisma/client";
import { protectedProcedure } from "@server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const createChapter = protectedProcedure
  .input(
    z.object({
      chapterId: z.string().cuid().optional(),
      title: z.string(),
      content: z.unknown().transform((v) => v as Prisma.JsonObject),
      bookId: z.string().cuid().optional(),
      publishedAt: z
        .union([
          z.date().refine((date) => date.getTime() > Date.now()),
          z.boolean(),
        ])
        .optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { chapterId, title, content, bookId, publishedAt } = input;
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
    }

    await ctx.prisma.chapter.upsert({
      where: { id: chapterId },
      create: {
        title: title,
        content: content,
        publishedAt:
          typeof publishedAt === "boolean" ? new Date() : publishedAt,
        bookId,
        ownerId: ctx.session.user.id,
      },
      update: {
        title: title,
        content: content,
        publishedAt:
          typeof publishedAt === "boolean" ? new Date() : publishedAt,
        bookId,
        ownerId: ctx.session.user.id,
      },
    });
  });

export default createChapter;
