import { BookStatus } from "@prisma/client";
import { z } from "zod";
import { publicProcedure } from "~/server/api/trpc";

const getAllComments = publicProcedure
  .input(z.object({ chapterId: z.string().cuid() }))
  .query(async ({ ctx, input }) => {
    return await ctx.prisma.chapterComment.findMany({
      where: {
        chapter: {
          id: input.chapterId,
          book: {
            status: {
              in: [
                BookStatus.PUBLISHED,
                BookStatus.COMPLETED,
                BookStatus.ARCHIVED,
              ],
            },
          },
          publishedAt: {
            lte: new Date(),
          },
        },
        parent: {
          is: null,
        },
      },
      select: {
        id: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  });

export default getAllComments;
