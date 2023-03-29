import { BookOwnerStatus, Prisma } from "@prisma/client";
import { protectedProcedure } from "@server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const getBookCollaborators = protectedProcedure
  .input(z.object({ bookId: z.string().cuid() }))
  .query(async ({ ctx, input }) => {
    const { bookId } = input;
    // check whether the book is yours
    try {
      const book = await ctx.prisma.book.findFirstOrThrow({
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
                select: {
                  id: true,
                  penname: true,
                  image: true,
                },
              },
            },
          },
        },
      });

      return book.owners;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "book does not exist",
          cause: err,
        });
      } else {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "something went wrong",
          cause: err,
        });
      }
    }
  });

export default getBookCollaborators;
