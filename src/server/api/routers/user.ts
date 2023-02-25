import { z } from "zod";
import { Prisma } from "@prisma/client";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const userRouter = createTRPCRouter({
  getData: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    return ctx.prisma.user.findUnique({
      where: {
        penname: input,
      },
      select: {
        id: true,
        penname: true,
        image: true,
        coin: true,
        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
      },
    });
  }),
  getFollowing: publicProcedure
    .input(
      z.object({
        penname: z.string(),
        cursor: z.string().optional(),
        take: z.number().default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.user.findMany({
        where: {
          NOT: {
            penname: null,
          },
          followers: {
            some: {
              follower: {
                penname: input.penname,
              },
            },
          },
        },
        take: input.take,
        cursor: {
          penname: input.cursor,
        },
      });
    }),
  getFollowers: publicProcedure
    .input(
      z.object({
        penname: z.string(),
        cursor: z.string().optional(),
        take: z.number().default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.user.findMany({
        where: {
          NOT: {
            penname: null,
          },
          following: {
            some: {
              follower: {
                penname: input.penname,
              },
            },
          },
        },
        take: input.take,
        cursor: {
          penname: input.cursor,
        },
      });
    }),
  update: protectedProcedure
    .input(
      z.object({
        penname: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const user = await ctx.prisma.user.update({
          where: {
            id: ctx.session.user.id,
          },
          data: input,
        });
        return user;
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          if (e.code === "P2002" && input.penname) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `penname already taken: ${input.penname}`,
              cause: e,
            });
          }
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "something went wrong",
          cause: e,
        });
      }
    }),
});
