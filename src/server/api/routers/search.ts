import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

let numSearchUsers = 0;

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
      numSearchUsers++;
      console.log("search", numSearchUsers);
      return await ctx.prisma.user.findMany({
        take: input.take,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        where: {
          penname: {
            contains: input.search,
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
      return await ctx.prisma.book.findMany({
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
    }),
});
