import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";

const update = protectedProcedure
  .input(
    z.object({
      penname: z.string().trim().optional(),
      bio: z.string().trim().nullable().optional(),
      profileImageUrl: z.string().url().nullable().optional(),
      wallpaperImageUrl: z.string().url().nullable().optional(),
      description: z.string().trim().nullable().optional(),
      location: z.string().trim().nullable().optional(),
      facebookContact: z.string().trim().nullable().optional(),
      instagramContact: z.string().trim().nullable().optional(),
      emailContact: z.string().trim().nullable().optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { penname, profileImageUrl, wallpaperImageUrl, bio,
      description, location, facebookContact, instagramContact, emailContact } = input;

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

    return await ctx.prisma.user.update({
      where: {
        id: ctx.session.user.id,
      },
      data: {
        penname,
        bio,
        description,
        location,
        facebookContact,
        instagramContact,
        emailContact,
        image: profileImageUrl,
        wallpaperImage: wallpaperImageUrl,
      },
    });
  });

export default update;
