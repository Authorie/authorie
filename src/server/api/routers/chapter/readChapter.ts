import { publicProcedure } from "@server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const readChapter = publicProcedure
  .input(z.object({ id: z.string().cuid() }))
  .mutation(async ({ ctx, input }) => {
    let chapter;
    try {
      chapter = await ctx.prisma.chapter.findUniqueOrThrow({
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
    } catch (err) {
      console.error(err);
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Chapter not found",
        cause: err,
      });
    }

    if (chapter.publishedAt && chapter.publishedAt.getTime() > Date.now()) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Chapter not published yet",
      });
    }

    try {
      await ctx.prisma.chapter.update({
        where: { id: input.id },
        data: {
          views: {
            increment: 1,
          },
        },
      });
    } catch (err) {
      console.error(err);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong",
        cause: err,
      });
    }
  });

export default readChapter;
