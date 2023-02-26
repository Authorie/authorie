import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const searchRouter = createTRPCRouter({
  searchUsers: publicProcedure
    .input(
      z.object({
        search: z.string(),
        take: z.number().default(5),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const users = await ctx.prisma.user.findMany({
        take: input.take,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        where: {
          penname: {
            contains: input.search,
          },
        },
      });
      return users;
    }),
  searchBooks: publicProcedure
    .input(
      z.object({
        search: z.string(),
        take: z.number().default(5),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const books = await ctx.prisma.book.findMany({
        take: input.take,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        where: {
          OR: [
            {
              title: {
                contains: input.search,
              },
            },
            {
              description: {
                contains: input.search,
              },
            },
          ],
        },
      });
      return books;
    }),
});
