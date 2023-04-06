import { publicProcedure } from "~/server/api/trpc";
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
  });

export default getUser;
