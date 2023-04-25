import { BookOwnerStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure } from "~/server/api/trpc";

const getUser = publicProcedure
  .input(
    z
      .union([
        z.object({ id: z.string().cuid() }),
        z.object({ penname: z.string() }),
      ])
      .optional()
  )
  .query(async ({ ctx, input }) => {
    if (!input) {
      if (!ctx.session) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "user does not exist",
        });
      }
      input = { id: ctx.session.user.id };
    }

    const user = await ctx.prisma.user.findUniqueOrThrow({
      where: "penname" in input ? { penname: input.penname } : { id: input.id },
      include: {
        followers: {
          select: {
            followerId: true,
          },
        },
        following: {
          select: {
            followingId: true,
          },
        },
        ownedChapters: {
          select: {
            id: true,
          },
        },
        posts: {
          select: {
            id: true,
          },
        },
        ownedBooks: {
          where: {
            status: {
              in: [BookOwnerStatus.OWNER, BookOwnerStatus.COLLABORATOR],
            },
          },
          select: {
            bookId: true,
          },
        },
      },
    });

    return {
      ...user,
      isOwner: ctx.session ? user.id === ctx.session.user.id : false,
      isFollowing: ctx.session
        ? user.followers.some(
          (follower) => follower.followerId === ctx.session?.user.id
        )
        : false,
      isFollower: ctx.session
        ? user.following.some(
          (following) => following.followingId === ctx.session?.user.id
        )
        : false,
    };
  });

export default getUser;
