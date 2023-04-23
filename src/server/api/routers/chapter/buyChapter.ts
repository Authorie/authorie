import { TRPCError } from "@trpc/server";
import z from "zod";
import { protectedProcedure } from "~/server/api/trpc";

const buyChapter = protectedProcedure
  .input(z.object({ chapterId: z.string().cuid() }))
  .mutation(async ({ ctx, input }) => {
    const { chapterId } = input;
    const chapter = await ctx.prisma.chapter.findUniqueOrThrow({
      where: { id: chapterId },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            coverImage: true,
            status: true,
          },
        },
        owner: {
          select: {
            id: true,
            penname: true,
            image: true,
          },
        },
        _count: {
          select: {
            views: true,
            likes: true,
            comments: true,
          },
        },
        chapterMarketHistories: true,
      },
    });

    if (
      chapter.chapterMarketHistories.some(
        (history) => history.userId === ctx.session.user.id
      )
    ) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Already bought",
      });
    }

    const user = await ctx.prisma.user.findUniqueOrThrow({
      where: { id: ctx.session.user.id },
      select: {
        coin: true,
      },
    });

    if (user.coin < chapter.price) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Not enough coin",
      });
    }

    await ctx.prisma.$transaction([
      ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: {
          coin: {
            decrement: chapter.price,
          },
        },
      }),
      ctx.prisma.user.update({
        where: { id: chapter.ownerId },
        data: {
          coin: {
            increment: chapter.price,
          },
        },
      }),
      ctx.prisma.chapterMarketHistory.create({
        data: {
          chapterId,
          userId: ctx.session.user.id,
          price: chapter.price,
        },
      }),
    ]);

    return chapter;
  });

export default buyChapter;
