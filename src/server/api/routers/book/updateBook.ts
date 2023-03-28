import { BookOwnerStatus, BookStatus } from "@prisma/client";
import { protectedProcedure } from "@server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const updateBook = protectedProcedure
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
  });

export default updateBook;
