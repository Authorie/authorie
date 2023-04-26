import dayjs from "dayjs";
import { protectedProcedure } from "~/server/api/trpc";

const getDraftChapters = protectedProcedure.query(async ({ ctx }) => {
  const minPublishedAt = dayjs().subtract(1, "hour").toDate();

  return await ctx.prisma.chapter.findMany({
    where: {
      ownerId: ctx.session.user.id,
      OR: [
        {
          publishedAt: null,
        },
        {
          publishedAt: {
            gt: minPublishedAt,
          },
        },
      ],
    },
    select: {
      id: true,
    },
  });
});

export default getDraftChapters;
