import type { Prisma } from "@prisma/client";
import { protectedProcedure } from "~/server/api/trpc";
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
    }

    const userData: Prisma.UserUpdateInput = {
      penname,
      bio,
      image: profileImageUrl,
      wallpaperImage: wallpaperImageUrl,
    };

    return await ctx.prisma.user.update({
      where: {
        id: ctx.session.user.id,
      },
      data: userData,
    });
  });

export default update;
