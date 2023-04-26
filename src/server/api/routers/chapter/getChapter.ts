import { z } from "zod";
import { publicProcedure } from "~/server/api/trpc";

const getChapter = publicProcedure
  .input(z.object({ id: z.string().cuid() }))
  .query(async ({ ctx, input }) => {
    const chapter = await ctx.prisma.chapter.findUniqueOrThrow({
      where: { id: input.id },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            coverImage: true,
            wallpaperImage: true,
            status: true,
            owners: {
              include: {
                user: {
                  select: {
                    id: true,
                    penname: true,
                    image: true,
                  },
                },
              },
            },
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
    return {
      ...chapter,
      isLiked: ctx.session
        ? Boolean(
          await ctx.prisma.chapterLike.findUnique({
            where: {
              chapterId_userId: {
                chapterId: input.id,
                userId: ctx.session.user.id,
              },
            },
          })
        )
        : false,
    };
  });

export default getChapter;
