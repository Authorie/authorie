import { BookOwnerStatus, BookStatus } from "@prisma/client";
import { protectedProcedure } from "@server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const moveState = protectedProcedure
  .input(
    z.object({
      id: z.string().cuid(),
      status: z.enum([
        BookStatus.DRAFT,
        BookStatus.PUBLISHED,
        BookStatus.COMPLETED,
        BookStatus.ARCHIVED,
      ]),
      force: z.boolean().default(false),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { id, status, force } = input;
    let book;
    try {
      book = await ctx.prisma.book.findUniqueOrThrow({
        where: { id },
        include: {
          owners: true,
        },
      });
    } catch (err) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "book not found",
        cause: err,
      });
    }

    if (
      !book.owners.some(
        (owner) =>
          owner.userId === ctx.session.user.id &&
          owner.status === BookOwnerStatus.OWNER
      )
    ) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "you are not owner of this book",
      });
    }

    switch (book.status) {
      case BookStatus.INITIAL:
        if (status !== BookStatus.DRAFT) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "initial status can only be changed to draft status",
          });
        }
        if (
          force &&
          book.owners.some((owner) => owner.status === BookOwnerStatus.INVITEE)
        ) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `there are still invite(s) to collaborate in this book. 
            please wait for their response or remove them first`,
          });
        }
        break;
      case BookStatus.DRAFT:
        if (
          status !== BookStatus.PUBLISHED &&
          status !== BookStatus.COMPLETED
        ) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "draft status can only be changed to published or completed status",
          });
        }
        break;
      case BookStatus.PUBLISHED:
        if (status !== BookStatus.COMPLETED && status !== BookStatus.ARCHIVED) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "published status can only be changed to completed or archived status",
          });
        }
        break;
      case BookStatus.COMPLETED:
        if (status !== BookStatus.ARCHIVED) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "completed status can only be changed to archived status",
          });
        }
        break;
      case BookStatus.ARCHIVED:
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "archived status cannot be changed",
        });
      default:
        break;
    }

    try {
      await ctx.prisma.book.update({
        where: { id },
        data: {
          status,
          owners:
            book.status === BookStatus.INITIAL
              ? {
                  deleteMany: {
                    status: {
                      notIn: [
                        BookOwnerStatus.OWNER,
                        BookOwnerStatus.COLLABORATOR,
                      ],
                    },
                  },
                }
              : undefined,
        },
      });
    } catch (err) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "failed to move book state",
        cause: err,
      });
    }
  });

export default moveState;
