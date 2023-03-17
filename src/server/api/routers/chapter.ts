import type { Prisma } from "@prisma/client";
import { BookStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const chapterRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z.object({
        all: z.boolean().default(true),
        categoryIds: z.string().uuid().array().optional(),
        cursor: z.string().uuid().optional(),
        limit: z.number().int().default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const { all, categoryIds, cursor, limit } = input;
      if (all) {
        try {
          const chapters = await ctx.prisma.chapter.findMany({
            take: limit + 1,
            cursor: cursor ? { id: cursor } : undefined,
            orderBy: {
              createdAt: "desc",
            },
          });
          let nextCursor: typeof cursor | undefined = undefined;
          if (chapters.length > limit) {
            const nextItem = chapters.pop();
            nextCursor = nextItem?.id;
          }

          return {
            chapters,
            nextCursor,
          };
        } catch (err) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to get chapters",
            cause: err,
          });
        }
      }

      if (categoryIds) {
        try {
          const chapters = await ctx.prisma.chapter.findMany({
            where: {
              book: {
                status: {
                  in: [BookStatus.PUBLISHED, BookStatus.COMPLETED],
                },
                categories: {
                  some: {
                    categoryId: {
                      in: categoryIds,
                    },
                  },
                },
              },
            },
            take: limit + 1,
            cursor: cursor ? { id: cursor } : undefined,
            orderBy: {
              createdAt: "desc",
            },
          });
          let nextCursor: typeof cursor | undefined = undefined;
          if (chapters.length > limit) {
            const nextItem = chapters.pop();
            nextCursor = nextItem?.id;
          }

          return {
            chapters,
            nextCursor,
          };
        } catch (err) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to get chapters",
            cause: err,
          });
        }
      }

      if (ctx.session?.user?.id) {
        try {
          const followingCategories = await ctx.prisma.category.findMany({
            where: {
              users: {
                some: {
                  userId: ctx.session.user.id,
                },
              },
            },
          });
          const chapters = await ctx.prisma.chapter.findMany({
            where: {
              book: {
                status: {
                  in: [BookStatus.PUBLISHED, BookStatus.COMPLETED],
                },
                categories: {
                  some: {
                    categoryId: {
                      in: followingCategories.map((c) => c.id),
                    },
                  },
                },
              },
            },
            take: limit + 1,
            cursor: cursor ? { id: cursor } : undefined,
            orderBy: {
              createdAt: "desc",
            },
          });
          let nextCursor: typeof cursor | undefined = undefined;
          if (chapters.length > limit) {
            const nextItem = chapters.pop();
            nextCursor = nextItem?.id;
          }

          return {
            chapters,
            nextCursor,
          };
        } catch (err) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to get chapters",
            cause: err,
          });
        }
      }

      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid request",
      });
    }),
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
      let book;
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
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().optional(),
        content: z
          .unknown()
          .transform((v) => v as Prisma.JsonObject)
          .optional(),
        publishedAt: z
          .date()
          .refine((v) => v.getTime() >= Date.now(), {
            message: "Date in the past",
          })
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      let chapter;
      const { id, title, content, publishedAt } = input;
      try {
        chapter = await ctx.prisma.chapter.findUniqueOrThrow({
          where: {
            id,
          },
          include: {
            book: {
              select: {
                status: true,
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

      if (chapter.ownerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not the owner of this chapter",
        });
      }

      if (chapter.publishedAt.getTime() < Date.now()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You can't update a published chapter",
        });
      }

      const validBookStatus = [BookStatus.DRAFT, BookStatus.PUBLISHED];
      if (!validBookStatus.includes(chapter.book.status)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You can't update chapters of this book",
        });
      }

      try {
        return await ctx.prisma.chapter.update({
          where: { id },
          data: {
            title,
            content,
            publishedAt,
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
      let chapter;
      try {
        chapter = await ctx.prisma.chapter.findUniqueOrThrow({
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
      } catch (err) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Chapter not found",
          cause: err,
        });
      }

      if (chapter.publishedAt.getTime() > Date.now()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Chapter not published yet",
        });
      }

      // needs discussion about whether to add views of archived books
      const validBookStatus = [BookStatus.PUBLISHED, BookStatus.COMPLETED];
      if (!validBookStatus.includes(chapter.book.status)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You can't read chapters of this book",
        });
      }

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
      let chapter;
      try {
        chapter = await ctx.prisma.chapter.findUniqueOrThrow({
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
      } catch (err) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Chapter not found",
          cause: err,
        });
      }

      if (chapter.publishedAt.getTime() > Date.now()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Chapter not published yet",
        });
      }

      // needs discussion about whether to like archived books
      const validBookStatus = [BookStatus.PUBLISHED, BookStatus.COMPLETED];
      if (!validBookStatus.includes(chapter.book.status)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You can't like chapters of this book",
        });
      }

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
        parent: z.string().uuid().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      let chapter;
      try {
        chapter = await ctx.prisma.chapter.findUniqueOrThrow({
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
      } catch (err) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Chapter not found",
          cause: err,
        });
      }

      if (chapter.publishedAt.getTime() > Date.now()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Chapter not published yet",
        });
      }

      // needs discussion about whether to comment archived books
      const validBookStatus = [BookStatus.PUBLISHED, BookStatus.COMPLETED];
      if (!validBookStatus.includes(chapter.book.status)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You can't comment chapters of this book",
        });
      }

      if (input.parent) {
        try {
          await ctx.prisma.chapterComment.findUniqueOrThrow({
            where: {
              id: input.parent,
            },
          });
        } catch (err) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Parent comment not found",
            cause: err,
          });
        }
      }

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
            parent: input.parent
              ? {
                  connect: {
                    id: input.parent,
                  },
                }
              : undefined,
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
