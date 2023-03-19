import { BookStatus, Prisma } from "@prisma/client";
import { makePagination } from "@server/utils";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const chapterRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z.object({
        categoryIds: z.string().cuid().array().optional(),
        cursor: z.string().cuid().optional(),
        limit: z.number().int().default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const { categoryIds, cursor, limit } = input;
      const chapterFindManyArgs = {
        where: {},
        include: {
          book: {
            select: {
              id: true,
              title: true,
              coverImage: true,
            },
          },
          owner: {
            select: {
              id: true,
              penname: true,
              image: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          createdAt: "desc" as const,
        },
      };

      if (categoryIds) {
        chapterFindManyArgs.where = {
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
        };
      } else if (ctx.session?.user?.id) {
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
          chapterFindManyArgs.where = {
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
          };
        } catch (err) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to get chapters",
            cause: err,
          });
        }
      } else {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid request",
        });
      }

      const chapters = await ctx.prisma.chapter.findMany(chapterFindManyArgs);
      return makePagination(chapters, limit);
    }),
  getData: publicProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.chapter.findUniqueOrThrow({
          where: { id: input.id },
          include: {
            book: {
              select: {
                id: true,
                title: true,
                coverImage: true,
              },
            },
            owner: {
              select: {
                id: true,
                penname: true,
                image: true,
              },
            },
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
  getChapterLikes: publicProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      try {
        await ctx.prisma.chapter.findFirstOrThrow({
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
      } catch (err) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Chapter not found",
          cause: err,
        });
      }

      try {
        const likes = await ctx.prisma.chapterLike.findMany({
          where: {
            chapterId: input.id,
          },
          include: {
            user: {
              select: {
                id: true,
                penname: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        return likes;
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get chapter comments",
          cause: err,
        });
      }
    }),
  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        content: z.unknown().transform((v) => v as Prisma.JsonObject),
        bookId: z.string().cuid().optional(),
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
      if (bookId) {
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

      try {
        return await ctx.prisma.chapter.create({
          data: {
            title: title,
            content: content,
            publishedAt: publishedAt,
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
        id: z.string().cuid(),
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
    .input(z.object({ id: z.string().cuid() }))
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
  isLike: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
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

      try {
        return !!(await ctx.prisma.chapterLike.findUnique({
          where: {
            chapterId_userId: {
              chapterId: input.id,
              userId: ctx.session.user.id,
            },
          },
        }));
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
          cause: err,
        });
      }
    }),
  like: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
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
  unlike: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
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

      try {
        await ctx.prisma.chapterLike.findUniqueOrThrow({
          where: {
            chapterId_userId: {
              chapterId: input.id,
              userId: ctx.session.user.id,
            },
          },
        });
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "You haven't liked this chapter yet",
          });
        } else {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Something went wrong",
            cause: err,
          });
        }
      }

      try {
        await ctx.prisma.chapterLike.delete({
          where: {
            chapterId_userId: {
              chapterId: input.id,
              userId: ctx.session.user.id,
            },
          },
        });
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "failed to unlike",
          cause: err,
        });
      }
    }),
});
