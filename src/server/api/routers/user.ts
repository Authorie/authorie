import { Prisma } from "@prisma/client";
import { z } from "zod";

import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  getData: publicProcedure
    .input(z.string().optional())
    .query(async ({ ctx, input }) => {
      if (input == undefined && ctx.session?.user.penname == undefined) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "user does not exist",
        });
      }

      if (input == undefined && ctx.session?.user.penname != undefined) {
        input = ctx.session.user.penname;
      }

      try {
        return await ctx.prisma.user.findUniqueOrThrow({
          where: {
            penname: input,
          },
          select: {
            id: true,
            penname: true,
            image: true,
            coin: true,
            bio: true,
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
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "can't get user's data",
            cause: e,
          });
        } else {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "something went wrong",
            cause: e,
          });
        }
      }
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
      return await ctx.prisma.user.findMany({
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
  followUser: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.followingFollower.create({
          data: {
            follower: {
              connect: {
                id: ctx.session.user.id,
              },
            },
            following: {
              connect: {
                id: input,
              },
            },
          },
        });
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          if (e.code === "P2002") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `user does not exist: ${input}`,
              cause: e,
            });
          }
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `you are already following ${input}`,
            cause: e,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "something went wrong",
          cause: e,
        });
      }
    }),
  unfollowUser: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.followingFollower.delete({
          where: {
            followingId_followerId: {
              followingId: input,
              followerId: ctx.session.user.id,
            },
          },
        });
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          if (e.code === "P2002") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `user does not exist: ${input}`,
              cause: e,
            });
          }
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `you are already following ${input}`,
            cause: e,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "something went wrong",
          cause: e,
        });
      }
    }),
  isFollowUser: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      try {
        const following = await ctx.prisma.followingFollower.findFirst({
          where: {
            followerId: ctx.session.user.id,
            following: {
              penname: input,
            },
          },
        });
        return Boolean(following);
      } catch (e) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "something went wrong",
          cause: e,
        });
      }
    }),
  update: protectedProcedure
    .input(
      z.object({
        penname: z.string().trim().optional(),
        image: z.string().url().optional(),
        bio: z.string().trim().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.user.update({
          where: {
            id: ctx.session.user.id,
          },
          data: input,
        });
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          if (
            e.code === "P2002" &&
            e.meta &&
            "target" in e.meta &&
            typeof e.meta.target === "string" &&
            input.penname &&
            e.meta.target.includes("penname")
          ) {
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
