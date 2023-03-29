import { protectedProcedure } from "@server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const isLike = protectedProcedure
  .input(z.object({ id: z.string().cuid() }))
  .query(async ({ ctx, input }) => {
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
      console.error(err);
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Chapter not found",
        cause: err,
      });
    }

    if (chapter.publishedAt && chapter.publishedAt.getTime() > Date.now()) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Chapter not published yet",
      });
    }

    try {
      return !!(await ctx.prisma.chapterLike.findUnique({
        where: {
          chapterId_userId: {
            chapterId: input.id,
            userId: ctx.session.user.id,
          },
        },
      }));
    } catch (err) {
      console.error(err);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong",
        cause: err,
      });
    }
  });

export default isLike;
