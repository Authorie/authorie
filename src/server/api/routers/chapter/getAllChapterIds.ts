import { publicProcedure } from "~/server/api/trpc";

const getAllChapterIds = publicProcedure.query(async ({ ctx }) => {
  return await ctx.prisma.chapter.findMany({
    where: {
      bookId: {
        not: null,
      }
    },
    select: {
      id: true,
    },
  });
});

export default getAllChapterIds;
