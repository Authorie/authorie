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
    const marketHistories = await ctx.prisma.chapterMarketHistory.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      select: {
        chapterId: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    return makePagination(
      marketHistories.map(({ chapterId }) => ({ id: chapterId })),
      limit
    );
  });

export default getPurchased;
