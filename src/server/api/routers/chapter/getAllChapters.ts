import type { Prisma } from "@prisma/client";
import { BookStatus } from "@prisma/client";
import { publicProcedure } from "@server/api/trpc";
import { makePagination } from "@server/utils";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const getAllChapters = publicProcedure
  .input(
    z.object({
      categoryIds: z.string().cuid().array().optional(),
      publishedAt: z.date().optional(),
      cursor: z.string().cuid().optional(),
      limit: z.number().int().default(20),
    })
  )
  .query(async ({ ctx, input }) => {
    const { categoryIds, publishedAt, cursor, limit } = input;
    const chapterFindManyArgs = {
      where: publishedAt
        ? ({
            publishedAt: {
              lte: publishedAt,
            },
          } as Prisma.ChapterWhereInput)
        : {},
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
  });

export default getAllChapters;
