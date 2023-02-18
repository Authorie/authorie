import { z } from "zod";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

export const categoryRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.category.findMany();
  }),
  getFollowed: protectedProcedure.query(({ ctx }) => {
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
  follow: protectedProcedure.input(z.string()).mutation(({ ctx, input }) => {
    return ctx.prisma.user.update({
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
  unfollow: protectedProcedure.input(z.string()).mutation(({ ctx, input }) => {
    return ctx.prisma.user.update({
      where: {
        id: ctx.session.user.id,
      },
      data: {
        categories: {
          delete: {
            categoryId_userId: {
              userId: ctx.session.user.id,
              categoryId: input,
            },
          },
        },
      },
    });
  }),
  create: publicProcedure.input(z.string()).mutation(({ ctx, input }) => {
    return ctx.prisma.category.create({
      data: {
        name: input,
      },
    });
  }),
});
