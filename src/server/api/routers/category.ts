import { z } from "zod";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

export const categoryRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.category.findMany();
  }),
  getFollowedCategories: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.category.findMany({
      where: {
        users: {
          some: {
            userId: ctx.session.user.id,
          },
        },
      },
    });
  }),
  followCategory: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      ctx.prisma.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          categories: {
            create: {
              categoryId: input,
            },
          },
        },
      });
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
