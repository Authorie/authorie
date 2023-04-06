import { BookStatus } from "@prisma/client";
import { publicProcedure } from "~/server/api/trpc";
import { makePagination } from "~/server/utils";
import { z } from "zod";

const searchChapters = publicProcedure
  .input(
    z.object({
      search: z.string(),
      cursor: z.string().cuid().optional(),
      limit: z.number().int().min(1).max(10).default(5),
    })
  )
  .query(async ({ ctx, input }) => {
    const { search, limit, cursor } = input;
    const chapters = await ctx.prisma.chapter.findMany({
      where: {
        title: {
          contains: search,
        },
        publishedAt: {
          lte: new Date(),
        },
        book: {
          status: {
            in: [BookStatus.PUBLISHED, BookStatus.COMPLETED],
          },
        },
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
          },
        },
        owner: {
          select: {
            id: true,
            penname: true,
          },
        },
      },
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });
    return makePagination(chapters, limit);
  });

export default searchChapters;
