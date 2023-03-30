import { publicProcedure } from "@server/api/trpc";
import { makePagination } from "@server/utils";
import { z } from "zod";

const getFollowers = publicProcedure
  .input(
    z.object({
      penname: z.string(),
      cursor: z.string().cuid().optional(),
      limit: z.number().int().default(20),
    })
  )
  .query(async ({ ctx, input }) => {
    const { penname, cursor, limit } = input;
    const followers = await ctx.prisma.user.findMany({
      where: {
        penname: {
          not: null,
        },
        following: {
          some: {
            following: {
              penname,
            },
          },
        },
      },
      include: {
        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
      },
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });
    return makePagination(followers, limit);
  });

export default getFollowers;
