import { TRPCError } from "@trpc/server";
import z from "zod";
import { protectedProcedure } from "~/server/api/trpc";

const changeChapterPrice = protectedProcedure
  .input(
    z.object({ chapterId: z.string().cuid(), price: z.number().int().min(0) })
  )
  .mutation(async ({ ctx, input }) => {
    const { chapterId, price } = input;
    const chapter = await ctx.prisma.chapter.findFirst({
      where: { id: chapterId, ownerId: ctx.session.user.id },
    });
    if (!chapter) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Chapter not found",
      });
    }

    await ctx.prisma.chapter.update({
      where: { id: chapterId },
      data: {
        price,
      },
    });
  });

export default changeChapterPrice;
