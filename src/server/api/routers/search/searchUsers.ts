import { publicProcedure } from "@server/api/trpc";
import { makePagination } from "@server/utils";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const searchUsers = publicProcedure
  .input(
    z.object({
      search: z.string(),
      cursor: z.string().uuid().optional(),
      limit: z.number().int().min(1).max(10).default(5),
    })
  )
  .query(async ({ ctx, input }) => {
    const { search, limit, cursor } = input;
    try {
      const users = await ctx.prisma.user.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        where: {
          penname: {
            contains: search,
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
      });
      return makePagination(users, limit);
    } catch (err) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "something went wrong",
        cause: err,
      });
    }
  });

export default searchUsers;
