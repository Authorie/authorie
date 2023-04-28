import { makePagination } from "~/server/utils";
import { protectedProcedure } from "../../trpc";
import z from "zod";

const getPurchased = protectedProcedure
  .input(
    z.object({
      cursor: z.string().cuid().optional(),
      limit: z.number().int().default(20),
    })
  )
  .query(async ({ ctx, input }) => {
    const { cursor, limit } = input;
    return makePagination(
      await ctx.prisma.chapter.findMany({
        where: {
          chapterMarketHistories: {
            some: {
              userId: ctx.session.user.id,
            },
          },
        },
        orderBy: {
          publishedAt: "desc",
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
      }),
      limit
    );
  });

export default getPurchased;
