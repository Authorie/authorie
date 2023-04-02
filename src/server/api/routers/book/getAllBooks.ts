import { BookStatus } from "@prisma/client";
import { publicProcedure } from "@server/api/trpc";
import { z } from "zod";
import { computeIsOwner } from "./utils";

const getAllBooks = publicProcedure
  .input(
    z.object({
      penname: z.string(),
      status: z
        .enum([
          BookStatus.INITIAL,
          BookStatus.DRAFT,
          BookStatus.PUBLISHED,
          BookStatus.COMPLETED,
          BookStatus.ARCHIVED,
        ])
        .array()
        .default([
          BookStatus.INITIAL,
          BookStatus.DRAFT,
          BookStatus.PUBLISHED,
          BookStatus.COMPLETED,
        ]),
    })
  )
  .query(async ({ ctx, input }) => {
    const { penname, status } = input;
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
    };
    if (!ctx.session?.user.id) {
      bookFindManyArgs.where = {
        status: {
          in: [BookStatus.PUBLISHED, BookStatus.COMPLETED].filter((s) =>
            status.includes(s)
          ),
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
              in: [BookStatus.INITIAL, BookStatus.DRAFT].filter((s) =>
                status.includes(s)
              ),
            },
            owners: {
              some: {
                user: {
                  AND: [
                    {
                      penname: penname,
                    },
                    {
                      id: ctx.session.user.id,
                    },
                  ],
                },
              },
            },
          },
          {
            status: {
              in: [BookStatus.PUBLISHED, BookStatus.COMPLETED].filter((s) =>
                status.includes(s)
              ),
            },
            owners: {
              some: {
                user: {
                  penname: penname,
                },
              },
            },
          },
          {
            status: {
              in: [BookStatus.ARCHIVED].filter((s) => status.includes(s)),
            },
            owners: {
              some: {
                user: {
                  penname: penname,
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
