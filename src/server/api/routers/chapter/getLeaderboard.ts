import { z } from "zod";
import { publicProcedure } from "~/server/api/trpc";

const getLeaderboard = publicProcedure
  .input(
    z.object({
      limit: z.number().int().min(1).max(20).default(10),
      skip: z.number().int().min(0).default(0),
    })
  )
  .query(async ({ ctx, input }) => {
    const { limit, skip } = input;

    const firstDayThisMonth = new Date();
    firstDayThisMonth.setDate(1);
    firstDayThisMonth.setHours(0, 0, 0, 0);

    const firstDayNextMonth = new Date();
    if (firstDayNextMonth.getMonth() === 11) {
      firstDayNextMonth.setFullYear(firstDayNextMonth.getFullYear() + 1);
      firstDayNextMonth.setMonth(0);
    } else {
      firstDayNextMonth.setMonth(firstDayNextMonth.getMonth() + 1);
    }
    firstDayNextMonth.setDate(1);
    firstDayNextMonth.setHours(0, 0, 0, 0);

    return await ctx.prisma.chapterView.groupBy({
      by: ["chapterId"],
      where: {
        createdAt: {
          gte: firstDayThisMonth,
          lt: firstDayNextMonth,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: limit,
      skip,
    });
  });

export default getLeaderboard;
