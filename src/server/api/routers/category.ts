import { z } from "zod";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

export const categoryRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(z.string().array().optional())
    .query(({ ctx, input }) => {
      if (ctx.session?.user) {
        return ctx.prisma.category.findMany({
          where: {
            users: {
              none: {
                userId: ctx.session.user.id,
              },
            },
          },
        });
      }
      if (input) {
        return ctx.prisma.category.findMany({
          where: {
            id: {
              notIn: input,
            },
          },
        });
      }
      return ctx.prisma.category.findMany();
    }),
  getFollowed: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.prisma.categoriesOnUsers.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      select: {
        category: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
    return result.map((res) => res.category);
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
});
