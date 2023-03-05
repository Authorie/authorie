import { BookOwnerStatus, BookStatus, Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const bookRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z.object({
        penname: z.string(),
        cursor: z.string().optional(),
        take: z.number().default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const { penname, cursor, take } = input;
      if (!ctx.session?.user?.penname) {
        return await ctx.prisma.book.findMany({
          where: {
            status: BookStatus.PUBLISHED,
            owners: {
              some: {
                user: {
                  penname: penname,
                },
              },
            },
          },
          cursor: cursor ? { id: cursor } : undefined,
          take,
        });
      }
      return await ctx.prisma.book.findMany({
        where: {
          OR: [
            {
              status: {
                in: [BookStatus.INITIAL, BookStatus.DRAFT],
              },
              owners: {
                some: {
                  user: {
                    penname: {
                      in: [ctx.session.user.penname, penname],
                    },
                  },
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
                    penname: penname,
                  },
                },
              },
            },
            {
              status: BookStatus.ARCHIVED,
              owners: {
                some: {
                  user: {
                    penname: penname,
                  },
                },
              },
            },
          ],
        },
        cursor: cursor ? { id: cursor } : undefined,
        take,
      });
    }),
  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        invitees: z.array(z.string()).default([]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { title, description, invitees } = input;
      try {
        return await ctx.prisma.book.create({
          data: {
            title,
            description,
            owners: {
              createMany: {
                data: [
                  {
                    userId: ctx.session.user.id,
                    status: BookOwnerStatus.OWNER,
                  },
                  ...invitees.map((invitee) => ({
                    userId: invitee,
                    status: BookOwnerStatus.INVITEE,
                  })),
                ],
              },
            },
          },
        });
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          if (e.code === "P2003") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "user not found: " + invitees.join(", "),
              cause: e,
            });
          }
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "failed to create book",
          cause: e,
        });
      }
    }),
  favorite: protectedProcedure
    .input(
      z.object({
        bookId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { bookId } = input;
      try {
        await ctx.prisma.favoriteBook.create({
          data: {
            bookId,
            userId: ctx.session.user.id,
          },
        });
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          if (e.code === "P2002") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "book not found: " + bookId,
              cause: e,
            });
          }
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "failed to favorite book",
          cause: e,
        });
      }
    }),
  isFavorite: protectedProcedure
    .input(
      z.object({
        bookId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { bookId } = input;
        const favorite = await ctx.prisma.favoriteBook.findUnique({
          where: {
            bookId_userId: {
              bookId,
              userId: ctx.session.user.id,
            },
          },
        });
        return Boolean(favorite);
      } catch (e) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "failed to check favorite",
          cause: e,
        });
      }
    }),
});
