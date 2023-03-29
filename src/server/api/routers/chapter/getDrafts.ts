import { protectedProcedure } from "@server/api/trpc";
import { TRPCError } from "@trpc/server";

const getDraftChapters = protectedProcedure.query(async ({ ctx }) => {
  try {
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
  } catch (err) {
    console.error(err);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to get drafts",
      cause: err,
    });
  }
});

export default getDraftChapters;
