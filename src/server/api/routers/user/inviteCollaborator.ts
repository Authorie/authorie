import { BookOwnerStatus } from "@prisma/client";
import { protectedProcedure } from "@server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const inviteCollaborator = protectedProcedure
  .input(z.object({ bookId: z.string().cuid(), userId: z.string().uuid() }))
  .mutation(async ({ ctx, input }) => {
    const { bookId, userId } = input;
    // check if the book exists
    let book;
    try {
      book = await ctx.prisma.book.findUniqueOrThrow({
        where: {
          id: bookId,
        },
        include: {
          owners: {
            include: {
              user: {
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
              },
            },
          },
        },
      });
    } catch (err) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "book does not exist",
        cause: err,
      });
    }

    // check if the caller is the owner of the book
    const isOwner = book.owners.some(
      (owner) => owner.userId === ctx.session.user.id
    );
    if (!isOwner) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "you are not the owner of the book",
      });
    }

    // check if the user is already a collaborator
    const isCollaborator = book.owners.some((owner) => owner.userId === userId);
    if (isCollaborator) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "user is already a collaborator",
      });
    }

    book.owners.forEach(({ user }) => {
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

    // check if the user exists
    try {
      await ctx.prisma.user.findUniqueOrThrow({
        where: {
          id: userId,
        },
      });
    } catch (err) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "user does not exist",
        cause: err,
      });
    }

    // create the invite
    try {
      return await ctx.prisma.bookOwner.create({
        data: {
          bookId,
          userId,
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
