import { z } from "zod";
import { publicProcedure } from "~/server/api/trpc";

const getChapter = publicProcedure
  .input(z.object({ id: z.string().cuid() }))
  .query(async ({ ctx, input }) => {
    return await ctx.prisma.chapter.findUniqueOrThrow({
      where: { id: input.id },
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
        chapterMarketHistories: {
          where: {
            userId: ctx.session?.user.id,
          },
        },
      },
    });
  });

export default getChapter;
