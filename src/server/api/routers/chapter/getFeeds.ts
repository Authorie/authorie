import { BookStatus } from "@prisma/client";
import { publicProcedure } from "~/server/api/trpc";
import { makePagination } from "~/server/utils";
import { z } from "zod";

const getFeeds = publicProcedure
  .input(
    z.object({
      categoryIds: z.string().cuid().array().optional(),
      publishedAt: z.date().default(new Date()),
      cursor: z.string().cuid().optional(),
      limit: z.number().int().default(20),
    })
  )
  .query(async ({ ctx, input }) => {
    const { categoryIds, publishedAt, cursor, limit } = input;
    const chapters = await ctx.prisma.chapter.findMany({
      where: {
        publishedAt: {
          lte: publishedAt,
        },
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
      include: {
        book: {
          select: {
            id: true,
            title: true,
            wallpaperImage: true,
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
            views: true,
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
    });
    return makePagination(chapters, limit);
  });

export default getFeeds;
