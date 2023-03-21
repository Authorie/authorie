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
          console.error(err);
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
        console.error(err);
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Chapter not found",
          cause: err,
        });
      }
    }),
  getDrafts: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.prisma.chapter.findMany({
        where: {
          ownerId: ctx.session.user.id,
          OR: [
            {
              publishedAt: null,
            },
            {
              publishedAt: {
                gt: new Date(),
              },
            },
          ],
        },
        include: {
          book: true,
        },
      });
    } catch (err) {
      console.error(err);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get drafts",
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
        console.error(err);
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
        console.error(err);
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
      let book;
      const { chapterId, title, content, bookId, publishedAt } = input;
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
          console.error(err);
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

      if (chapterId) {
        let chapter;
        try {
          chapter = await ctx.prisma.chapter.findUniqueOrThrow({
            where: {
              id: chapterId,
            },
          });
        } catch (err) {
          console.error(err);
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

        try {
          return await ctx.prisma.chapter.update({
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
            }
          });
        } catch (err) {
          console.error(err);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Something went wrong",
            cause: err,
          });
        }
      }

      try {
        return await ctx.prisma.chapter.create({
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
          }
        });
      } catch (err) {
        console.error(err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
          cause: err,
        });
      }
    }),
  deleteDraft: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      let chapter;
      try {
        chapter = await ctx.prisma.chapter.findUniqueOrThrow({
          where: {
            id: input.id,
          },
          include: {
            owner: true,
          },
        });
      } catch (err) {
        console.error(err);
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
      if (chapter.publishedAt && chapter.publishedAt.getTime() < Date.now()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You can't delete a published chapter",
        });
      }
      try {
        return await ctx.prisma.chapter.delete({
          where: {
            id: input.id,
          },
        });
      } catch (err) {
        console.error(err);
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
        console.error(err);
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Chapter not found",
          cause: err,
        });
      }

      if (chapter.publishedAt && chapter.publishedAt.getTime() > Date.now()) {
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
        console.error(err);
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
        console.error(err);
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Chapter not found",
          cause: err,
        });
      }

      if (chapter.publishedAt && chapter.publishedAt.getTime() > Date.now()) {
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
        console.error(err);
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
        console.error(err);
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Chapter not found",
          cause: err,
        });
      }

      if (chapter.publishedAt && chapter.publishedAt.getTime() > Date.now()) {
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
        console.error(err);
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
        console.error(err);
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Chapter not found",
          cause: err,
        });
      }

      if (chapter.publishedAt && chapter.publishedAt.getTime() > Date.now()) {
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
        console.error(err);
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
        console.error(err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "failed to unlike",
          cause: err,
        });
      }
    }),
});
