import type { Prisma } from "@prisma/client";
import { BookStatus } from "@prisma/client";
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
    await ctx.prisma.$transaction(async (tx) => {
      let book;
      const { chapterId, title, content, bookId, publishedAt } = input;
      if (bookId) {
        book = await ctx.prisma.book.findUniqueOrThrow({
          where: {
            id: bookId,
          },
          include: {
            owners: {
              select: {
                userId: true,
              },
            },
          },
        });

        if (
          !book.owners.some((owner) => owner.userId === ctx.session.user.id)
        ) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You are not the owner of this book",
          });
        }

        const validBookStatus = [BookStatus.DRAFT, BookStatus.PUBLISHED];
        if (!validBookStatus.includes(book.status)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "You can't add chapters to this book",
          });
        }
      } else {
        if (publishedAt) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "You can't publish a chapter without a book",
          });
        }
      }

      if (chapterId) {
        const chapter = await ctx.prisma.chapter.findUniqueOrThrow({
          where: {
            id: chapterId,
          },
        });

        if (chapter.ownerId !== ctx.session.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You are not the owner of this chapter",
          });
        }

        if (
          publishedAt &&
          chapter.publishedAt &&
          chapter.publishedAt.getTime() < Date.now()
        ) {
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
            title: title,
            content: content,
            publishedAt:
              typeof publishedAt === "boolean" ? new Date() : publishedAt,
            book: bookId
              ? {
                  connect: {
                    id: bookId,
                  },
                }
              : undefined,
            owner: {
              connect: {
                id: ctx.session.user.id,
              },
            },
          },
          include: {
            book: true,
          },
        });
      } else {
        await ctx.prisma.chapter.create({
          data: {
            title: title,
            content: content,
            publishedAt:
              typeof publishedAt === "boolean" ? new Date() : publishedAt,
            book: bookId
              ? {
                  connect: {
                    id: bookId,
                  },
                }
              : undefined,
            owner: {
              connect: {
                id: ctx.session.user.id,
              },
            },
          },
          include: {
            book: true,
          },
        });
      }
    });
  });

export default createChapter;
