import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure } from "~/server/api/trpc";

const getUser = publicProcedure
  .input(z.string().optional())
  .query(async ({ ctx, input }) => {
    if (input === undefined && !ctx.session) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "user does not exist",
      });
    }

    return await ctx.prisma.user.findUniqueOrThrow({
      where: input ? { penname: input } : { id: ctx.session?.user.id },
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
