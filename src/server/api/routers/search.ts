import { BookOwnerStatus, BookStatus } from "@prisma/client";
import { makePagination } from "@server/utils";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const searchRouter = createTRPCRouter({
  searchUsers: publicProcedure
    .input(
      z.object({
        search: z.string(),
        cursor: z.string().uuid().optional(),
        limit: z.number().int().min(1).max(10).default(5),
      })
    )
    .query(async ({ ctx, input }) => {
      const { search, limit, cursor } = input;
      try {
        const users = await ctx.prisma.user.findMany({
          take: limit + 1,
          cursor: cursor ? { id: cursor } : undefined,
          where: {
            penname: {
              contains: search,
            },
          },
          include: {
            _count: {
              select: {
                followers: true,
                following: true,
              },
            },
          },
        });
        return makePagination(users, limit);
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "something went wrong",
          cause: err,
        });
      }
    }),
  searchBooks: publicProcedure
    .input(
      z.object({
        search: z.object({
          userId: z.string().cuid().optional(),
          penname: z.string().optional(),
          title: z.string().optional(),
          description: z.string().optional(),
          status: z.nativeEnum(BookStatus).array().optional(),
        }),
        cursor: z.string().uuid().optional(),
        limit: z.number().int().min(1).max(10).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { search, limit, cursor } = input;
      try {
        const books = await ctx.prisma.book.findMany({
          take: limit ? limit + 1 : undefined,
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
            OR: [
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
        });
        return makePagination(books, limit || books.length + 1);
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "something went wrong",
          cause: err,
        });
      }
    }),
});
