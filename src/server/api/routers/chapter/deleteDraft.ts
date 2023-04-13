import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";

const deleteDraftChapter = protectedProcedure
  .input(z.object({ id: z.string().cuid() }))
  .mutation(async ({ ctx, input }) => {
    const chapter = await ctx.prisma.chapter.findFirst({
      where: {
        id: input.id,
        ownerId: ctx.session.user.id,
      },
      include: {
        owner: true,
      },
    });

    if (!chapter) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Chapter not found",
      });
    }

    if (chapter.publishedAt && chapter.publishedAt.getTime() < Date.now()) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "You can't delete a published chapter",
      });
    }

    await ctx.prisma.chapter.delete({
      where: {
        id: input.id,
      },
    });
  });

export default deleteDraftChapter;
