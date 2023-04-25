import { BookOwnerStatus, BookStatus, type Prisma } from "@prisma/client";
import { z } from "zod";
import { publicProcedure } from "~/server/api/trpc";

const getAllBooks = publicProcedure
  .input(
    z.object({
      penname: z.string(),
    })
  )
  .query(async ({ ctx, input }) => {
    const { penname } = input;
    const bookFindManyArgs = {
      where: {},
      select: { id: true },
    } satisfies Prisma.BookFindManyArgs;
    if (!ctx.session) {
      bookFindManyArgs.where = {
        status: {
          in: [BookStatus.PUBLISHED, BookStatus.COMPLETED],
        },
        owners: {
          some: {
            user: {
              penname: penname,
            },
          },
        },
      };
    } else if (ctx.session.user.penname !== penname) {
      bookFindManyArgs.where = {
        OR: [
          {
            status: {
              in: [BookStatus.INITIAL, BookStatus.DRAFT],
            },
            owners: {
              some: {
                AND: [
                  {
                    status: {
                      in: [BookOwnerStatus.OWNER, BookOwnerStatus.COLLABORATOR],
                    },
                    user: {
                      penname,
                    },
                  },
                  {
                    userId: ctx.session?.user.id,
                    status: {
                      in: [
                        BookOwnerStatus.OWNER,
                        BookOwnerStatus.COLLABORATOR,
                        BookOwnerStatus.INVITEE,
                      ],
                    },
                  },
                ],
              },
            },
          },
          {
            status: {
              in: [BookStatus.PUBLISHED, BookStatus.COMPLETED],
            },
            owners: {
              some: {
                user: {
                  penname,
                },
              },
            },
          },
          {
            status: {
              in: [BookStatus.ARCHIVED],
            },
            owners: {
              some: {
                user: {
                  penname,
                },
              },
            },
          },
        ],
      };
    } else {
      bookFindManyArgs.where = {
        owners: {
          some: {
            userId: ctx.session?.user.id,
          },
        },
      };
    }

    return await ctx.prisma.book.findMany(bookFindManyArgs);
  });

export default getAllBooks;
