import { publicProcedure } from "@server/api/trpc";
import { z } from "zod";

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
      },
    });
  });

export default getChapter;
