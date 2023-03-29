import { Prisma } from "@prisma/client";
import { publicProcedure } from "@server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const getUser = publicProcedure
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
          wallpaperImage: true,
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
        } else {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "can't get user's data",
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
  });

export default getUser;
