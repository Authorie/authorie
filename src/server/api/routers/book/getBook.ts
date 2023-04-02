import { BookOwnerStatus, BookStatus } from "@prisma/client";
import { publicProcedure } from "@server/api/trpc";
import { z } from "zod";
import { computeIsOwner } from "./utils";

const getBook = publicProcedure
  .input(z.object({ id: z.string().cuid() }))
  .query(async ({ ctx, input }) => {
    let isOwner = false;
    if (ctx.session?.user.id) {
      isOwner = !!(await ctx.prisma.bookOwner.findFirst({
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
          status: {
            in: isOwner
              ? [
                  BookStatus.INITIAL,
                  BookStatus.DRAFT,
                  BookStatus.PUBLISHED,
                  BookStatus.COMPLETED,
                ]
              : [BookStatus.PUBLISHED, BookStatus.COMPLETED],
          },
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
            where: isOwner
              ? {
                  publishedAt: {
                    lte: new Date(),
                  },
                }
              : undefined,
            select: {
              id: true,
              title: true,
              views: true,
              chapterNo: true,
              publishedAt: true,
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
