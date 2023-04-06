import { BookStatus } from "@prisma/client";
import { publicProcedure } from "@server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const readChapter = publicProcedure
  .input(z.object({ id: z.string().cuid() }))
  .mutation(async ({ ctx, input }) => {
    const identifier = ctx.session?.user.id || "anonymous";
    const { success } = await ctx.ratelimit.limit(identifier, {
      geo: { ip: ctx.ip },
    });
    if (!success) return;

    const chapter = await ctx.prisma.chapter.findUniqueOrThrow({
      where: {
        id: input.id,
      },
      include: {
        book: {
          select: {
            status: true,
          },
        },
      },
    });

    if (!chapter.book || chapter.book.status === BookStatus.DRAFT) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Book not published yet",
      });
    }

    if (chapter.publishedAt && chapter.publishedAt.getTime() > Date.now()) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Chapter not published yet",
      });
    }

    await ctx.prisma.chapterView.create({
      data: {
        chapterId: input.id,
        userId: ctx.session?.user.id,
      },
    });
  });

export default readChapter;
