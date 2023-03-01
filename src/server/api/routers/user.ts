import { z } from "zod";
import { Prisma } from "@prisma/client";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const userRouter = createTRPCRouter({
  getData: publicProcedure
    .input(z.string().optional())
    .query(async ({ ctx, input }) => {
      if (input) {
        try {
          return await ctx.prisma.user.findUniqueOrThrow({
            where: {
              penname: input
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
        } catch (e) {
          if (e instanceof Prisma.PrismaClientKnownRequestError) {
            if (e.code === "P2005") {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: `user does not exist: ${
                  input || ctx.session?.user?.id || ""
                }`,
                cause: e,
              });
            }
          } else {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "something went wrong",
              cause: e,
            });
          }
        }
      } else if (ctx.session?.user) {
        try {
          return await ctx.prisma.user.findUniqueOrThrow({
            where: {
              id: ctx.session.user.id
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
        } catch (e) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "something went wrong",
            cause: e,
          });
        }
      }
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "you are not logged in",
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
      return await ctx.prisma.user.findMany({
        where: {
          NOT: {
            penname: null
          },
          followers: {
            some: {
              follower: {
                penname: input.penname
              }
            }
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
      return await ctx.prisma.user.findMany({
        where: {
          NOT: {
            penname: null
          },
          following: {
            some: {
              follower: {
                penname: input.penname
              }
            }
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
        await ctx.prisma.user.update({
          where: {
            id: ctx.session.user.id,
          },
          data: input,
        });
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
