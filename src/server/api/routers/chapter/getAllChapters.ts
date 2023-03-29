import { BookStatus } from "@prisma/client";
import { publicProcedure } from "@server/api/trpc";
import { makePagination } from "@server/utils";
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
    const chapters = await ctx.prisma.chapter.findMany({
      where: {
        publishedAt: publishedAt ? { lte: publishedAt } : {},
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
    });
    return makePagination(chapters, limit);
  });

export default getAllChapters;
