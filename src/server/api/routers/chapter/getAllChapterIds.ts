import { publicProcedure } from "~/server/api/trpc";

const getAllChapterIds = publicProcedure.query(async ({ ctx }) => {
  return await ctx.prisma.chapter.findMany({
    where: {
      bookId: {
        not: null,
      },
      publishedAt: {
        lte: new Date(),
      },
    },
    select: {
      id: true,
    },
  });
});

export default getAllChapterIds;
