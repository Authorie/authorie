import { BookStatus, type Chapter } from "@prisma/client";
import { z } from "zod";
import { publicProcedure } from "~/server/api/trpc";

// checkChapterReadable
// return false means the chapter is not readable (no book, not owner, book is draft or archived, valid book state but not free)
// return true means the chapter is readable (owner, book is published or completed and free)
const checkChapterReadable = (
  chapter: Chapter & {
    book: { owners: { user: { id: string } }[]; status: BookStatus } | null;
    chapterMarketHistories: { userId: string }[];
  },
  userId: string | undefined
) => {
  if (!chapter || !chapter.book) {
    return false;
  }

  const isOwner =
    chapter.ownerId === userId ||
    chapter.book.owners.some(({ user: owner }) => owner.id === userId) ||
    chapter.chapterMarketHistories.some((history) => history.userId === userId);
  if (isOwner) {
    return true;
  }

  switch (chapter.book.status) {
    case BookStatus.PUBLISHED:
    case BookStatus.COMPLETED:
      return chapter.price === 0;
    case BookStatus.ARCHIVED:
      return false;
  }
};

const getChapter = publicProcedure
  .input(z.object({ id: z.string().cuid() }))
  .query(async ({ ctx, input }) => {
    const chapter = await ctx.prisma.chapter.findUniqueOrThrow({
      where: { id: input.id },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            coverImage: true,
            wallpaperImage: true,
            status: true,
            owners: {
              include: {
                user: {
                  select: {
                    id: true,
                    penname: true,
                    image: true,
                  },
                },
              },
            },
          },
        },
        owner: {
          select: {
            id: true,
            penname: true,
            image: true,
          },
        },
        _count: {
          select: {
            views: true,
            likes: true,
            comments: true,
          },
        },
        chapterMarketHistories: true,
      },
    });

    let nextChapterId: string | null = null,
      previousChapterId: string | null = null;
    if (chapter.chapterNo !== null && chapter.chapterNo > 0) {
      // use Promise.all to run both queries at the same time
      const [nextChapter, previousChapter] = await Promise.all([
        ctx.prisma.chapter.findFirst({
          where: {
            bookId: chapter.bookId,
            chapterNo: chapter.chapterNo + 1,
          },
          select: {
            id: true,
          },
        }),
        ctx.prisma.chapter.findFirst({
          where: {
            bookId: chapter.bookId,
            chapterNo: {
              equals: chapter.chapterNo - 1,
              gt: 0,
            },
          },
          select: {
            id: true,
          },
        }),
      ]);

      if (nextChapter) {
        nextChapterId = nextChapter.id;
      }
      if (previousChapter) {
        previousChapterId = previousChapter.id;
      }
    }
    return {
      ...chapter,
      nextChapterId,
      previousChapterId,
      isChapterReadable: checkChapterReadable(chapter, ctx.session?.user.id),
      isLiked: ctx.session
        ? Boolean(
          await ctx.prisma.chapterLike.findUnique({
            where: {
              chapterId_userId: {
                chapterId: input.id,
                userId: ctx.session.user.id,
              },
            },
          })
        )
        : false,
    };
  });

export default getChapter;
