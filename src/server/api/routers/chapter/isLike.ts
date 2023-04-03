import { protectedProcedure } from "@server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const isLike = protectedProcedure
  .input(z.object({ id: z.string().cuid() }))
  .query(async ({ ctx, input }) => {
    const chapter = await ctx.prisma.chapter.findUnique({
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

    if (!chapter) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Chapter not found",
      });
    }

    if (chapter.publishedAt && chapter.publishedAt.getTime() > Date.now()) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Chapter not published yet",
      });
    }

    return Boolean(
      await ctx.prisma.chapterLike.findUnique({
        where: {
          chapterId_userId: {
            chapterId: input.id,
            userId: ctx.session.user.id,
          },
        },
      })
    );
  });

export default isLike;
