import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const categoryRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.category.findMany();
  }),
  create: publicProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    const category = await ctx.prisma.category.create({
      data: {
        name: input,
      },
    });
    return category;
  }),
});
