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
    try {
      await ctx.prisma.chapter.findFirstOrThrow({
        where: {
          id: input.id,
          book: {
            status: {
              in: [
                BookStatus.PUBLISHED,
                BookStatus.COMPLETED,
                BookStatus.ARCHIVED,
              ],
            },
          },
          publishedAt: {
            lte: new Date(),
          },
        },
        include: { book: true },
      });
    } catch (err) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Chapter not found",
        cause: err,
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