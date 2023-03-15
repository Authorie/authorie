import type { Book, Prisma } from "@prisma/client";
import { BookStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const chapterRouter = createTRPCRouter({
  getData: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.chapter.findUniqueOrThrow({
          where: { id: input.id },
          include: {
            _count: {
              select: {
                likes: true,
                comments: true,
              },
            },
          },
        });
      } catch (err) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Chapter not found",
          cause: err,
        });
      }
    }),
  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        content: z.unknown().transform((v) => v as Prisma.JsonObject),
        bookId: z.string().uuid(),
        publishedAt: z
          .date()
          .refine((v) => v.getTime() >= Date.now(), {
            message: "Date in the past",
          })
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      let book: Book & { owners: { userId: string }[] };
      const { title, content, bookId, publishedAt } = input;
      try {
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
      } catch (err) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Book not found",
          cause: err,
        });
      }

      if (!book.owners.some((owner) => owner.userId === ctx.session.user.id)) {
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

      try {
        return await ctx.prisma.chapter.create({
          data: {
            title: title,
            content: content,
            publishedAt: publishedAt,
            book: {
              connect: {
                id: bookId,
              },
            },
            owner: {
              connect: {
                id: ctx.session.user.id,
              },
            },
          },
        });
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
          cause: err,
        });
      }
    }),
  read: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.chapter.update({
          where: { id: input.id },
          data: {
            views: {
              increment: 1,
            },
          },
        });
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
          cause: err,
        });
      }
    }),
  like: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.chapterLike.upsert({
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
        });
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "failed to like",
          cause: err,
        });
      }
    }),
  comment: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        content: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.chapterComment.create({
          data: {
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
          },
        });
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "failed to comment",
          cause: err,
        });
      }
    }),
});
