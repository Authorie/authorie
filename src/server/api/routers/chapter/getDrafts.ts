import { protectedProcedure } from "~/server/api/trpc";

const getDraftChapters = protectedProcedure.query(async ({ ctx }) => {
  const lastHour = new Date();
  if (lastHour.getHours() === 0) {
    lastHour.setHours(23);
    lastHour.setDate(lastHour.getDate() - 1);
  } else {
    lastHour.setHours(lastHour.getHours() - 1);
  }

  return await ctx.prisma.chapter.findMany({
    where: {
      ownerId: ctx.session.user.id,
      OR: [
        {
          publishedAt: null,
        },
        {
          publishedAt: {
            gt: lastHour,
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
