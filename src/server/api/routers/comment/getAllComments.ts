import { BookStatus } from "@prisma/client";
import { publicProcedure } from "@server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const getAllComments = publicProcedure
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
  });

export default getAllComments;
