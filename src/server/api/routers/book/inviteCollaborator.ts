import { BookOwnerStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";

const inviteCollaborator = protectedProcedure
  .input(z.object({ bookId: z.string().cuid(), penname: z.string() }))
  .mutation(async ({ ctx, input }) => {
    const { bookId, penname } = input;
    const user = await ctx.prisma.user.findFirst({
      where: {
        penname,
      },
    });
    if (!user) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "user does not exist",
      });
    }

    const book = await ctx.prisma.book.findFirst({
      where: {
        id: bookId,
        owners: {
          some: {
            userId: ctx.session.user.id,
            status: BookOwnerStatus.OWNER,
          },
        },
      },
      include: {
        owners: {
          include: {
            user: {
              include: {
                followers: {
                  where: {
                    followerId: user.id,
                  },
                },
                following: {
                  where: {
                    followingId: user.id,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!book) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "book does not exist",
      });
    }

    // check if the user is the caller
    if (user.id === ctx.session.user.id) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "you cannot invite yourself",
      });
    }

    const isCollaborator = book.owners.find(
      (owner) =>
        owner.status === BookOwnerStatus.COLLABORATOR &&
        owner.user.penname === penname
    );
    if (isCollaborator) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "user is already a collaborator",
      });
    }

    const owner = book.owners.find(
      (owner) => owner.userId === ctx.session.user.id
    );
    if (!owner) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "you are not the owner of this book",
      });
    }
    if (owner.user.followers.length === 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `User ${penname} is not following you`,
      });
    }
    if (owner.user.following.length === 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `You are not following user ${penname}}`,
      });
    }

    return await ctx.prisma.bookOwner.upsert({
      where: {
        bookId_userId: {
          bookId,
          userId: user.id,
        },
      },
      create: {
        book: {
          connect: {
            id: bookId,
          },
        },
        user: {
          connect: {
            id: user.id,
          },
        },
        status: BookOwnerStatus.INVITEE,
      },
      update: {
        book: {
          connect: {
            id: bookId,
          },
        },
        user: {
          connect: {
            id: user.id,
          },
        },
        status: BookOwnerStatus.INVITEE,
      },
    });
  });

export default inviteCollaborator;
