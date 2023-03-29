import { publicProcedure } from "@server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const getChapter = publicProcedure
  .input(z.object({ id: z.string().cuid() }))
  .query(async ({ ctx, input }) => {
    try {
      return await ctx.prisma.chapter.findUniqueOrThrow({
        where: { id: input.id },
        include: {
          book: {
            select: {
              id: true,
              title: true,
              coverImage: true,
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
              likes: true,
              comments: true,
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
  });

export default getChapter;
