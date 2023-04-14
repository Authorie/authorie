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
            title: true,
            chapterNo: true,
            publishedAt: true,
            _count: {
              select: {
                views: true,
                likes: true,
                comments: true,
              },
            },
            chapterMarketHistories: ctx.session ? {
              where: {
                userId: ctx.session.user.id,
              }
            } : false,
          },
        },
      },
    } satisfies Prisma.BookFindManyArgs;
    if (!ctx.session) {
      const where = {
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
      } satisfies Prisma.BookWhereInput;
      bookFindManyArgs.where = where;
    } else if (ctx.session.user.penname !== penname) {
      const where = {
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
      } satisfies Prisma.BookWhereInput;
      bookFindManyArgs.where = where;
    } else {
      const where = {
        owners: {
          some: {
            userId: ctx.session?.user.id,
          },
        },
      } satisfies Prisma.BookWhereInput;
      bookFindManyArgs.where = where;
    }

    return (await ctx.prisma.book.findMany(bookFindManyArgs)).map((book) =>
      computeIsOwner(ctx.session?.user.id, book)
    );
  });

export default getAllBooks;
