import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const searchRouter = createTRPCRouter({
  search: publicProcedure
    .input(
      z.object({
        search: z.string(),
        take: z.number().default(5),
        cursor: z
          .object({
            id: z.string(),
            email: z.string().email(),
          })
          .optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const users = await ctx.prisma.user.findMany({
        take: input.take,
        cursor: input.cursor,
        where: {
          penname: {
            contains: input.search,
            mode: "insensitive",
          },
        },
      });

      return { users };
    }),
});
