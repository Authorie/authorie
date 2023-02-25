import { Prisma } from "@prisma/client";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

export const categoryRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
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
  follow: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.categoriesOnUsers.create({
          data: {
            userId: ctx.session.user.id,
            categoryId: input,
          },
        });
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          if (e.code === "P2002") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `you have already followed this category: ${input}`,
              cause: e,
            });
          } else if (e.code === "P2003") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `user / category does not exist: category: ${input}, user: ${ctx.session.user.id}`,
              cause: e,
            });
          }
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          cause: e,
        });
      }
    }),
  unfollow: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.categoriesOnUsers.delete({
          where: {
            categoryId_userId: {
              userId: ctx.session.user.id,
              categoryId: input,
            },
          },
        });
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          if (e.code === "P2001") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `you have already unfollowed this category: ${input}`,
              cause: e,
            });
          } else if (e.code === "P2003") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `user / category does not exist: category: ${input}, user: ${ctx.session.user.id}`,
              cause: e,
            });
          }
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          cause: e,
        });
      }
    }),
});
