import { BookOwnerStatus, BookStatus } from "@prisma/client";
import { z } from "zod";
import { publicProcedure } from "~/server/api/trpc";
import { makePagination } from "~/server/utils";

const getAllChapters = publicProcedure
  .input(
    z.object({
      penname: z.string(),
      publishedAt: z.date().default(new Date()),
      cursor: z.string().cuid().optional(),
      limit: z.number().int().default(20),
    })
  )
  .query(async ({ ctx, input }) => {
    const { penname, publishedAt, cursor, limit } = input;
    const chapters = await ctx.prisma.chapter.findMany({
      where: {
        publishedAt: {
          lte: publishedAt,
        },
        book: {
          status: {
            in: [BookStatus.PUBLISHED, BookStatus.COMPLETED],
          },
          owners: {
            some: {
              status: {
                in: [BookOwnerStatus.OWNER, BookOwnerStatus.COLLABORATOR],
              },
              user: {
                penname,
              },
            },
          },
        },
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            wallpaperImage: true,
          },
        },
        owner: {
          select: {
            id: true,
            penname: true,
            image: true,
          },
        },
        chapterMarketHistories: {
          where: {
            userId: ctx.session?.user.id,
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
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: {
        createdAt: "desc" as const,
      },
    });
    return makePagination(chapters, limit);
  });

export default getAllChapters;
