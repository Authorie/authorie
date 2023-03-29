import { publicProcedure } from "@server/api/trpc";
import { makePagination } from "@server/utils";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const getFollowingUsers = publicProcedure
  .input(
    z.object({
      penname: z.string(),
      cursor: z.string().uuid().optional(),
      limit: z.number().int().default(20),
    })
  )
  .query(async ({ ctx, input }) => {
    const { penname, cursor, limit } = input;
    try {
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
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
      });
      return makePagination(followings, limit);
    } catch (err) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "something went wrong",
        cause: err,
      });
    }
  });

export default getFollowingUsers;
