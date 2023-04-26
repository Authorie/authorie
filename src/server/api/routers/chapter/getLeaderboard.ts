import dayjs from "dayjs";
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

    const firstDayOfThisMonth = dayjs().startOf("month").toDate();
    const LastDayOfThisMonth = dayjs().endOf("month").toDate();

    return await ctx.prisma.chapterView.groupBy({
      by: ["chapterId"],
      where: {
        createdAt: {
          gte: firstDayOfThisMonth,
          lte: LastDayOfThisMonth,
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
