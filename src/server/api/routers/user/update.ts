import type { Prisma } from "@prisma/client";
import { protectedProcedure } from "@server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const update = protectedProcedure
  .input(
    z.object({
      penname: z.string().trim().optional(),
      profileImageUrl: z.string().url().optional(),
      wallpaperImageUrl: z.string().url().optional(),
      bio: z.string().trim().optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { penname, profileImageUrl, wallpaperImageUrl, bio } = input;

    if (penname) {
      try {
        const exists = await ctx.prisma.user.findUnique({
          where: {
            penname: penname,
          },
        });
        if (exists !== null && exists.id !== ctx.session.user.id) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `penname already taken: ${penname}`,
          });
        }
      } catch (e) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "something went wrong",
          cause: e,
        });
      }
    }

    const userData: Prisma.UserUpdateInput = {
      penname,
      bio,
      image: profileImageUrl,
      wallpaperImage: wallpaperImageUrl,
    };

    try {
      return await ctx.prisma.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: userData,
      });
    } catch (e) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "something went wrong",
        cause: e,
      });
    }
  });

export default update;
