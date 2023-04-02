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

    return await ctx.prisma.chapterComment.findMany({
      where: {
        chapterId: input.chapterId,
        parent: {
          is: null,
        },
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
            likes: {
              where: {
                userId: ctx.session?.user.id,
              },
            },
          },
        },
        likes: {
          where: {
            userId: ctx.session?.user.id,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  });

export default getAllComments;
