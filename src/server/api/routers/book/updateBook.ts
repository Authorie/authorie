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
      chaptersArrangement: z.string().cuid().array().optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const {
      id,
      title,
      description,
      coverImageUrl,
      wallpaperImageUrl,
      category,
      chaptersArrangement,
    } = input;

    const book = await ctx.prisma.book.findFirst({
      where: {
        id,
        owners: {
          some: { userId: ctx.session.user.id, status: BookOwnerStatus.OWNER },
        },
      },
      include: {
        owners: {
          where: {
            userId: ctx.session.user.id,
            status: BookOwnerStatus.OWNER,
          },
        },
        chapters: true,
      },
    });

    if (!book) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "book not found",
      });
    }

    if (book.status === BookStatus.ARCHIVED) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "you cannot update archived book",
      });
    }

    await ctx.prisma.$transaction(async (trx) => {
      const promises: unknown[] = [
        trx.book.update({
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
        }),
      ];

      if (chaptersArrangement !== undefined) {
        const includeChapters = book.chapters.filter((c) =>
          chaptersArrangement.includes(c.id)
        );
        const nonincludeChapters = book.chapters.filter(
          (c) => !chaptersArrangement.includes(c.id)
        );
        if (includeChapters.length !== chaptersArrangement.length) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid chapter arrangement",
          });
        }

        promises.push(
          ...includeChapters.map((chapter, index) =>
            trx.chapter.update({
              where: {
                id: chapter.id,
              },
              data: {
                chapterNo: index,
              },
            })
          ),
          ...nonincludeChapters.map((chapter) =>
            trx.chapter.update({
              where: {
                id: chapter.id,
              },
              data: {
                chapterNo: null,
              },
            })
          )
        );
      }

      await Promise.all(promises);
    });
  });

export default updateBook;
