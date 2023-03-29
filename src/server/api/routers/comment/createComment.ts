import { BookStatus } from "@prisma/client";
import { protectedProcedure } from "@server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const createComment = protectedProcedure
  .input(
    z.object({
      id: z.string().cuid(),
      image: z.string().url().optional(),
      content: z.string(),
      parent: z.string().cuid().optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    let chapter;
    try {
      chapter = await ctx.prisma.chapter.findUniqueOrThrow({
        where: {
          id: input.id,
        },
        include: {
          book: {
            select: {
              status: true,
            },
          },
        },
      });
    } catch (err) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Chapter not found",
        cause: err,
      });
    }

    if (!chapter.publishedAt || chapter.publishedAt.getTime() > Date.now()) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Chapter not published yet",
      });
    }

    // needs discussion about whether to comment archived books
    const validBookStatus = [BookStatus.PUBLISHED, BookStatus.COMPLETED];
    if (!chapter.book || !validBookStatus.includes(chapter.book.status)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "You can't comment chapters of this book",
      });
    }

    if (input.parent) {
      try {
        await ctx.prisma.chapterComment.findUniqueOrThrow({
          where: {
            id: input.parent,
          },
        });
      } catch (err) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Parent comment not found",
          cause: err,
        });
      }
    }

    try {
      await ctx.prisma.chapterComment.create({
        data: {
          image: input.image,
          content: input.content,
          chapter: {
            connect: {
              id: input.id,
            },
          },
          user: {
            connect: {
              id: ctx.session.user.id,
            },
          },
          parent: input.parent
            ? {
                connect: {
                  id: input.parent,
                },
              }
            : undefined,
        },
      });
    } catch (err) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "failed to comment",
        cause: err,
      });
    }
  });

export default createComment;
