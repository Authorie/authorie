import { BookOwnerStatus } from "@prisma/client";
import { protectedProcedure } from "@server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const arrangeChapters = protectedProcedure
  .input(
    z.object({
      bookId: z.string().cuid(),
      chapterIds: z.array(z.string().cuid()),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const book = await ctx.prisma.book.findUnique({
      where: {
        id: input.bookId,
      },
      select: {
        id: true,
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
        message: "Book not found",
      });
    }

    if (book.owners.length === 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "You are not the owner of this book",
      });
    }

    const includeChapters = book.chapters.filter((c) =>
      input.chapterIds.includes(c.id)
    );
    const nonincludeChapters = book.chapters.filter(
      (c) => !input.chapterIds.includes(c.id)
    );
    if (includeChapters.length !== input.chapterIds.length) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid chapter ids",
      });
    }

    try {
      await ctx.prisma.$transaction([
        ...includeChapters.map((chapter, index) =>
          ctx.prisma.chapter.update({
            where: {
              id: chapter.id,
            },
            data: {
              chapterNo: index,
            },
          })
        ),
        ...nonincludeChapters.map((chapter) =>
          ctx.prisma.chapter.update({
            where: {
              id: chapter.id,
            },
            data: {
              chapterNo: null,
            },
          })
        ),
      ]);
    } catch (err) {
      console.error(err);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong",
        cause: err,
      });
    }
  });

export default arrangeChapters;
