import { BookStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const commentRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(z.object({ chapterId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      try {
        await ctx.prisma.chapter.findFirstOrThrow({
          where: {
            id: input.chapterId,
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
        const comments = await ctx.prisma.chapterComment.findMany({
          where: {
            chapterId: input.chapterId,
          },
          include: {
            user: {
              select: {
                id: true,
                penname: true,
                image: true,
              },
            },
            _count: {
              select: {
                likes: true,
                replies: true,
              },
            },
            replies: {
              include: {
                user: {
                  select: {
                    id: true,
                    penname: true,
                    image: true,
                  },
                },
                _count: {
                  select: {
                    likes: true,
                    replies: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        return comments;
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
        id: z.string().cuid(),
        image: z.string().url().optional(),
        content: z.string(),
        parent: z.string().cuid().optional(),
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

      if (!chapter.publishedAt || chapter.publishedAt.getTime() > Date.now()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Chapter not published yet",
        });
      }

      // needs discussion about whether to comment archived books
      const validBookStatus = [BookStatus.PUBLISHED, BookStatus.COMPLETED];
      if (!chapter.book || !validBookStatus.includes(chapter.book.status)) {
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
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "failed to comment",
          cause: err,
        });
      }
    }),
  isLike: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      try {
        return !!(await ctx.prisma.chapterCommentLike.findFirst({
          where: {
            commentId: input.id,
            userId: ctx.session.user.id,
          },
        }));
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "failed to check comment like",
          cause: err,
        });
      }
    }),
  like: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.chapterCommentLike.upsert({
          where: {
            commentId_userId: {
              commentId: input.id,
              userId: ctx.session.user.id,
            },
          },
          create: {
            comment: {
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
          message: "failed to like comment",
          cause: err,
        });
      }
    }),
  unlike: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.chapterCommentLike.delete({
          where: {
            commentId_userId: {
              commentId: input.id,
              userId: ctx.session.user.id,
            },
          },
        });
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "failed to unlike comment",
          cause: err,
        });
      }
    }),
});
