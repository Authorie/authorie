import { BookOwnerStatus } from "@prisma/client";
import { protectedProcedure } from "@server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const inviteCollaborator = protectedProcedure
  .input(z.object({ bookId: z.string().cuid(), userId: z.string().uuid() }))
  .mutation(async ({ ctx, input }) => {
    const { bookId, userId } = input;
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
                    followerId: userId,
                  },
                },
                following: {
                  where: {
                    followingId: userId,
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
    if (userId === ctx.session.user.id) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "you cannot invite yourself",
      });
    }

    const isCollaborator = book.owners.find(
      (owner) =>
        owner.status === BookOwnerStatus.COLLABORATOR && owner.userId === userId
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
        message: `User ${userId} is not following you`,
      });
    }
    if (owner.user.following.length === 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `You are not following user ${userId}}`,
      });
    }

    // create the invite
    try {
      return await ctx.prisma.bookOwner.upsert({
        where: {
          bookId_userId: {
            bookId,
            userId,
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
              id: userId,
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
              id: userId,
            },
          },
          status: BookOwnerStatus.INVITEE,
        },
      });
    } catch (err) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "something went wrong",
        cause: err,
      });
    }
  });

export default inviteCollaborator;
