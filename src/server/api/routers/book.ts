import { BookOwnerStatus, BookStatus, Prisma } from "@prisma/client";
import { makePagination } from "@server/utils";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

interface owners {
  owners: {
    user: {
      id: string;
    };
  }[];
}

type WithIsOwner<T> = T & {
  isOwner: boolean;
};

function computeIsOwner<User extends owners>(
  userId: string | undefined,
  user: User
): WithIsOwner<User> {
  return {
    ...user,
    isOwner: userId
      ? user.owners.some((owner) => owner.user.id === userId)
      : false,
  };
}

export const bookRouter = createTRPCRouter({
  getData: publicProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      let isOwner = false;
      if (ctx.session?.user.id) {
        isOwner = !!(await ctx.prisma.bookOwner.findFirst({
          where: {
            bookId: input.id,
            userId: ctx.session.user.id,
            status: {
              in: [BookOwnerStatus.OWNER, BookOwnerStatus.COLLABORATOR],
            },
          },
        }));
      }
      try {
        return computeIsOwner(
          ctx.session?.user?.id,
          await ctx.prisma.book.findFirstOrThrow({
            where: {
              id: input.id,
              status: {
                in: isOwner
                  ? [
                      BookStatus.INITIAL,
                      BookStatus.DRAFT,
                      BookStatus.PUBLISHED,
                      BookStatus.COMPLETED,
                    ]
                  : [BookStatus.PUBLISHED, BookStatus.COMPLETED],
              },
            },
            include: {
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
              chapters: {
                where: isOwner
                  ? {
                      publishedAt: {
                        lte: new Date(),
                      },
                    }
                  : undefined,
                select: {
                  id: true,
                  title: true,
                  views: true,
                  publishedAt: true,
                  _count: {
                    select: {
                      likes: true,
                      comments: true,
                    },
                  },
                },
              },
            },
          })
        );
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Book not found",
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
    }),
  getAll: publicProcedure
    .input(
      z.object({
        penname: z.string(),
        cursor: z.string().cuid().optional(),
        limit: z.number().int().default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const { penname, cursor, limit } = input;
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
    }),
  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        coverImageUrl: z.string().url().optional(),
        wallpaperImageUrl: z.string().url().optional(),
        invitees: z.array(z.string()).default([]),
        categoryIds: z.array(z.string()).default([]),
        initialStatus: z
          .enum([BookStatus.INITIAL, BookStatus.DRAFT, BookStatus.PUBLISHED])
          .default(BookStatus.INITIAL),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const {
        title,
        description,
        coverImageUrl,
        wallpaperImageUrl,
        invitees,
        initialStatus,
      } = input;
      if (invitees.length > 0) {
        if (initialStatus !== BookStatus.INITIAL) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot invite users to a non-initial book",
          });
        }
        let users;
        try {
          users = await ctx.prisma.user.findMany({
            where: {
              id: {
                in: invitees,
              },
            },
            include: {
              followers: {
                where: {
                  followerId: ctx.session.user.id,
                },
              },
              following: {
                where: {
                  followingId: ctx.session.user.id,
                },
              },
            },
          });
        } catch (err) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Something went wrong",
            cause: err,
          });
        }

        if (users.length !== invitees.length) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid user id(s)",
          });
        }

        users.forEach((user) => {
          if (user.followers.length === 0) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `User ${user.penname || user.id} is not following you`,
            });
          }
          if (user.following.length === 0) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `You are not following user ${user.penname || user.id}}`,
            });
          }
        });
      }
      try {
        return await ctx.prisma.book.create({
          data: {
            title,
            description,
            coverImage: coverImageUrl,
            wallpaperImage: wallpaperImageUrl,
            status: initialStatus,
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
        console.error(e);
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Failed to create book",
            cause: e,
          });
        } else {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "failed to create book",
            cause: e,
          });
        }
      }
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        coverImageUrl: z.string().url().optional(),
        wallpaperImageUrl: z.string().url().optional(),
        category: z.string().array().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      let book;
      const {
        id,
        title,
        description,
        coverImageUrl,
        wallpaperImageUrl,
        category,
      } = input;
      try {
        book = await ctx.prisma.book.findUniqueOrThrow({
          where: { id },
          include: {
            owners: {
              where: {
                userId: ctx.session.user.id,
                status: BookOwnerStatus.OWNER,
              },
            },
          },
        });
      } catch (err) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "book not found",
          cause: err,
        });
      }

      if (book.owners.length === 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "you are not the owner of this book",
        });
      }

      if (book.status === BookStatus.ARCHIVED) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "you cannot update archived book",
        });
      }

      try {
        await ctx.prisma.book.update({
          where: { id },
          data: {
            title,
            description,
            coverImage: coverImageUrl,
            wallpaperImage: wallpaperImageUrl,
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
    .input(z.object({ id: z.string().cuid() }))
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
    .input(z.object({ id: z.string().cuid() }))
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
    .input(z.object({ id: z.string().cuid() }))
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
        id: z.string().cuid(),
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
          where: { id },
          include: {
            owners: true,
          },
        });
      } catch (err) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "book not found",
          cause: err,
        });
      }

      if (
        book.owners.some(
          (owner) =>
            owner.userId === ctx.session.user.id &&
            owner.status === BookOwnerStatus.OWNER
        )
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "you are not owner of this book",
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
          if (
            book.owners.some(
              (owner) => owner.status === BookOwnerStatus.INVITEE
            )
          ) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `there are still invite(s) to collaborate in this book. 
                please wait for their response or remove them first`,
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
        default:
      }

      try {
        await ctx.prisma.book.update({
          where: { id },
          data: {
            status,
            owners:
              book.status === BookStatus.INITIAL
                ? {
                    deleteMany: {
                      status: BookOwnerStatus.REJECTED,
                    },
                  }
                : undefined,
          },
        });
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "failed to move book state",
          cause: err,
        });
      }
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      let book;
      try {
        book = await ctx.prisma.book.findUniqueOrThrow({
          where: { id: input.id },
          include: {
            owners: {
              where: {
                userId: ctx.session.user.id,
                status: BookOwnerStatus.OWNER,
              },
            },
          },
        });
      } catch (err) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "book not found",
          cause: err,
        });
      }

      if (book.owners.length === 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "you are not owner of this book",
        });
      }

      const validBookStatus = [BookStatus.INITIAL, BookStatus.DRAFT];
      if (!validBookStatus.includes(book.status)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "book cannot be deleted",
        });
      }

      try {
        await ctx.prisma.book.delete({
          where: { id },
        });
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "failed to delete book",
          cause: err,
        });
      }
    }),
});
