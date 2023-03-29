import { protectedProcedure } from "@server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const like = protectedProcedure
  .input(z.object({ id: z.string().cuid() }))
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
      await ctx.prisma.chapterLike.upsert({
        where: {
          chapterId_userId: {
            chapterId: input.id,
            userId: ctx.session.user.id,
          },
        },
        create: {
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
        },
        update: {},
      });
    } catch (err) {
      console.error(err);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "failed to like",
        cause: err,
      });
    }
  });

export default like;
