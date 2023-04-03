import { protectedProcedure } from "@server/api/trpc";

const getDraftChapters = protectedProcedure.query(async ({ ctx }) => {
  return await ctx.prisma.chapter.findMany({
    where: {
      ownerId: ctx.session.user.id,
      OR: [
        {
          publishedAt: null,
        },
        {
          publishedAt: {
            gt: new Date(),
          },
        },
      ],
    },
    include: {
      book: true,
    },
  });
});

export default getDraftChapters;
