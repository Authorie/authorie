import { BookOwnerStatus, BookStatus } from "@prisma/client";
import { z } from "zod";
import { publicProcedure } from "~/server/api/trpc";
import { computeIsOwner } from "./utils";

const getBook = publicProcedure
  .input(z.object({ id: z.string().cuid() }))
  .query(async ({ ctx, input }) => {
    let isContributor = false;
    if (ctx.session?.user.id) {
      isContributor = !!(await ctx.prisma.bookOwner.findFirst({
        where: {
          bookId: input.id,
          userId: ctx.session.user.id,
          status: {
            in: [BookOwnerStatus.OWNER, BookOwnerStatus.COLLABORATOR],
          },
        },
      }));
    }

    return computeIsOwner(
      ctx.session?.user?.id,
      await ctx.prisma.book.findFirstOrThrow({
        where: {
          id: input.id,
          status: !isContributor
            ? {
              in: [BookStatus.PUBLISHED, BookStatus.COMPLETED],
            }
            : {},
        },
        include: {
          categories: {
            select: {
              category: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
          owners: {
            select: {
              status: true,
              user: {
                select: {
                  id: true,
                  penname: true,
                  image: true,
                },
              },
            },
          },
          chapters: {
            where: !isContributor ? { publishedAt: { lte: new Date() } } : {},
            select: {
              id: true,
              title: true,
              views: true,
              price: true,
              ownerId: true,
              chapterNo: true,
              publishedAt: true,
              chapterMarketHistories: {
                where: {
                  userId: ctx.session?.user?.id,
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
          },
        },
      })
    );
  });

export default getBook;
