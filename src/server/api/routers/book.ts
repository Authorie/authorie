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
          include: {
            chapters: {
              where: {
                publishedAt: {
                  lte: new Date(),
                },
              },
              select: {
                id: true,
                title: true,
                publishedAt: true,
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
        include: {
          chapters: {
            select: {
              id: true,
              title: true,
              publishedAt: true,
            },
          },
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
        categoryIds: z.array(z.string()).default([]),
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
            categories: {
              createMany: {
                data: input.categoryIds.map((categoryId) => ({ categoryId })),
              },
            },
          },
        });
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          if (e.code === "P2003") {
            if (
              e.meta &&
              "target" in e.meta &&
              typeof e.meta.target === "string"
            ) {
              if (e.meta.target.includes("categories")) {
                throw new TRPCError({
                  code: "BAD_REQUEST",
                  message:
                    "category not found: " + input.categoryIds.join(", "),
                  cause: e,
                });
              } else if (e.meta.target.includes("owners")) {
                throw new TRPCError({
                  code: "BAD_REQUEST",
                  message: "user not found: " + invitees.join(", "),
                  cause: e,
                });
              }
            }
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "failed to create book",
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
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        category: z.string().array().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, title, description, category } = input;
      try {
        await ctx.prisma.book.update({
          where: { id },
          data: {
            title,
            description,
            categories: category
              ? {
                  upsert: category.map((categoryId) => ({
                    where: { bookId_categoryId: { bookId: id, categoryId } },
                    create: { categoryId },
                    update: {},
                  })),
                  deleteMany: {
                    categoryId: {
                      notIn: category,
                    },
                  },
                }
              : undefined,
          },
        });
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "failed to update book",
          cause: err,
        });
      }
    }),
  isFavorite: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      try {
        const favorite = await ctx.prisma.favoriteBook.findUnique({
          where: {
            bookId_userId: {
              bookId: input.id,
              userId: ctx.session.user.id,
            },
          },
        });
        return favorite !== null;
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "failed to check favorite",
          cause: err,
        });
      }
    }),
  favorite: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.favoriteBook.create({
          data: {
            bookId: input.id,
            userId: ctx.session.user.id,
          },
        });
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "failed to favorite",
          cause: err,
        });
      }
    }),
  unfavorite: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.favoriteBook.delete({
          where: {
            bookId_userId: {
              bookId: input.id,
              userId: ctx.session.user.id,
            },
          },
        });
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "failed to unfavorite",
          cause: err,
        });
      }
    }),
  moveState: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.enum([
          BookStatus.DRAFT,
          BookStatus.PUBLISHED,
          BookStatus.COMPLETED,
          BookStatus.ARCHIVED,
        ]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, status } = input;
      let book;
      try {
        book = await ctx.prisma.book.findUniqueOrThrow({
          where: { id: input.id },
        });
      } catch (err) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "book not found",
          cause: err,
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
        case BookStatus.PUBLISHED:
          if (
            status !== BookStatus.COMPLETED &&
            status !== BookStatus.ARCHIVED
          ) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message:
                "published status can only be changed to completed or archived status",
            });
          }
        case BookStatus.COMPLETED:
          if (status !== BookStatus.ARCHIVED) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message:
                "completed status can only be changed to archived status",
            });
          }
        case BookStatus.ARCHIVED:
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "archived status cannot be changed",
          });
      }

      try {
        await ctx.prisma.book.update({
          where: { id },
          data: { status },
        });
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "failed to move book state",
          cause: err,
        });
      }
    }),
});
