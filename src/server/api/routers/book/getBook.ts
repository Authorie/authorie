import { BookOwnerStatus } from "@prisma/client";
import { z } from "zod";
import { publicProcedure } from "~/server/api/trpc";
import { computeIsOwner } from "./utils";

const getBook = publicProcedure
  .input(z.object({ id: z.string().cuid() }))
  .query(async ({ ctx, input }) => {
    let isFavorite = false;
    let isContributor = false;
    if (ctx.session?.user.id) {
      [isContributor, isFavorite] = await Promise.all([
        ctx.prisma.bookOwner
          .findFirst({
            where: {
              bookId: input.id,
              userId: ctx.session.user.id,
              status: {
                in: [BookOwnerStatus.OWNER, BookOwnerStatus.COLLABORATOR],
              },
            },
          })
          .then((res) => Boolean(res)),
        ctx.prisma.favoriteBook
          .findFirst({
            where: {
              bookId: input.id,
              userId: ctx.session.user.id,
            },
          })
          .then((res) => Boolean(res)),
      ]);
    }

    const book = await ctx.prisma.book.findUniqueOrThrow({
      where: {
        id: input.id,
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
            chapterMarketHistories: true,
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
    });

    return { ...computeIsOwner(ctx.session?.user.id, book), isFavorite };
  });

export default getBook;
