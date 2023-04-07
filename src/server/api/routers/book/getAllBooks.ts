import { BookOwnerStatus, BookStatus, type Prisma } from "@prisma/client";
import { z } from "zod";
import { publicProcedure } from "~/server/api/trpc";
import { computeIsOwner } from "./utils";

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
      include: {
        owners: {
          select: {
            status: true,
            user: {
              select: {
                id: true,
                penname: true,
                image: true,
              },
            },
          },
        },
        categories: {
          select: {
            category: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        chapters: {
          select: {
            _count: {
              select: {
                views: true,
                likes: true,
              },
            },
          },
        },
      },
    } satisfies Prisma.BookFindManyArgs;
    if (!ctx.session?.user.id) {
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
    } else {
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
                    ownerId: ctx.session?.user.id,
                    status: {
                      in: [BookOwnerStatus.OWNER, BookOwnerStatus.COLLABORATOR],
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
    }
    return (await ctx.prisma.book.findMany(bookFindManyArgs)).map((book) =>
      computeIsOwner(ctx.session?.user.id, book)
    );
  });

export default getAllBooks;
