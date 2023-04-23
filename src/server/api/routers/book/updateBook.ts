import { BookOwnerStatus, BookStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";

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

    if (chaptersArrangement && book.chapters.filter(chapter => chapter.publishedAt).length !== chaptersArrangement.length) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "chapter arrangement must include all published chapters",
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
        promises.push(
          ...chaptersArrangement.map((chapterId, index) =>
            trx.chapter.update({
              where: {
                id: chapterId,
              },
              data: {
                chapterNo: index + 1,
              },
            })
          ),
        );
      }

      await Promise.all(promises);
    });
  });

export default updateBook;
