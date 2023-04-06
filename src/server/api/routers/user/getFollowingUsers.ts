import { publicProcedure } from "@server/api/trpc";
import { makePagination } from "@server/utils";
import { z } from "zod";

const getFollowingUsers = publicProcedure
  .input(
    z.object({
      penname: z.string(),
      cursor: z.string().cuid().optional(),
      limit: z.number().int().default(20),
    })
  )
  .query(async ({ ctx, input }) => {
    const { penname, cursor, limit } = input;
    const followings = await ctx.prisma.user.findMany({
      where: {
        NOT: {
          penname: null,
        },
        followers: {
          some: {
            follower: {
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
    return makePagination(followings, limit);
  });

export default getFollowingUsers;
