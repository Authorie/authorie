import { BookStatus, Prisma } from "@prisma/client";
import { publicProcedure } from "@server/api/trpc";
import { makePagination } from "@server/utils";
import { TRPCError } from "@trpc/server";
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
      cursor: z.string().cuid().optional(),
      limit: z.number().int().default(20),
    })
  )
  .query(async ({ ctx, input }) => {
    const { penname, status, cursor, limit } = input;
    const bookFindManyArgs = {
      where: {},
      include: {
        owners: {
          select: {
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
            views: true,
            _count: {
              select: {
                likes: true,
              },
            },
          },
        },
      },
      cursor: cursor ? { id: cursor } : undefined,
      take: limit + 1,
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
    try {
      const books = (await ctx.prisma.book.findMany(bookFindManyArgs)).map(
        (book) => {
          return computeIsOwner(ctx.session?.user.id, book);
        }
      );
      return makePagination(books, limit);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
          cause: err,
        });
      } else {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
          cause: err,
        });
      }
    }
  });

export default getAllBooks;
