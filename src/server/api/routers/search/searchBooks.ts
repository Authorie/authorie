import { BookOwnerStatus, BookStatus } from "@prisma/client";
import { z } from "zod";
import { publicProcedure } from "~/server/api/trpc";
import { makePagination } from "~/server/utils";

const searchBooks = publicProcedure
  .input(
    z.object({
      search: z.object({
        userId: z.string().cuid().optional(),
        penname: z.string().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        status: z.nativeEnum(BookStatus).array().optional(),
      }),
      cursor: z.string().cuid().optional(),
      limit: z.number().int().min(1).max(10).default(5),
    })
  )
  .query(async ({ ctx, input }) => {
    const { search, limit, cursor } = input;
    const books = await ctx.prisma.book.findMany({
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      where: {
        owners: {
          some: {
            user: search.userId
              ? {
                  id: search.userId,
                }
              : {
                  penname: {
                    contains: search.penname,
                  },
                },
            status: {
              in: [BookOwnerStatus.OWNER, BookOwnerStatus.COLLABORATOR],
            },
          },
        },
        AND: [
          {
            title: {
              contains: search.title,
            },
          },
          {
            description: {
              contains: search.description,
            },
          },
          {
            status: {
              in: search.status,
            },
          },
        ],
      },
      include: {
        owners: {
          where: {
            status: BookOwnerStatus.OWNER,
          },
          include: {
            user: {
              select: {
                id: true,
                penname: true,
              },
            },
          },
        },
      },
    });
    return makePagination(books, limit);
  });

export default searchBooks;
