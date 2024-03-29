import { BookOwnerStatus, BookStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";

const createBook = protectedProcedure
  .input(
    z.object({
      title: z.string(),
      description: z.string().optional(),
      coverImageUrl: z.string().url().optional(),
      wallpaperImageUrl: z.string().url().optional(),
      invitees: z.array(z.string()).default([]),
      categoryIds: z.array(z.string()).default([]),
      initialStatus: z
        .enum([BookStatus.INITIAL, BookStatus.DRAFT, BookStatus.PUBLISHED])
        .default(BookStatus.INITIAL),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const {
      title,
      description,
      coverImageUrl,
      wallpaperImageUrl,
      invitees,
      initialStatus,
    } = input;
    if (invitees.length > 0) {
      if (initialStatus !== BookStatus.INITIAL) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot invite users to a non-initial book",
        });
      }
      const users = await ctx.prisma.user.findMany({
        where: {
          id: {
            in: invitees,
          },
        },
        include: {
          followers: {
            where: {
              followerId: ctx.session.user.id,
            },
          },
          following: {
            where: {
              followingId: ctx.session.user.id,
            },
          },
        },
      });

      if (users.length !== invitees.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid user id(s)",
        });
      }

      users.forEach((user) => {
        if (user.followers.length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `User ${user.penname || user.id} is not following you`,
          });
        }
        if (user.following.length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `You are not following user ${user.penname || user.id}}`,
          });
        }
      });
    }

    await ctx.prisma.book.create({
      data: {
        title,
        description,
        coverImage: coverImageUrl,
        wallpaperImage: wallpaperImageUrl,
        status: initialStatus,
        owners: {
          createMany: {
            data: [
              {
                userId: ctx.session.user.id,
                status: BookOwnerStatus.OWNER,
              },
              ...invitees.map((invitee) => ({
                userId: invitee,
                status: BookOwnerStatus.INVITEE,
              })),
            ],
          },
        },
        categories: {
          createMany: {
            data: input.categoryIds.map((categoryId) => ({ categoryId })),
          },
        },
      },
    });
  });

export default createBook;
