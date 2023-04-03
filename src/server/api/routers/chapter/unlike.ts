import { protectedProcedure } from "@server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const unlike = protectedProcedure
  .input(z.object({ id: z.string().cuid() }))
  .mutation(async ({ ctx, input }) => {
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

    await ctx.prisma.chapterLike.delete({
      where: {
        chapterId_userId: {
          chapterId: input.id,
          userId: ctx.session.user.id,
        },
      },
    });
  });

export default unlike;
