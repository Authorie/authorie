import { protectedProcedure } from "@server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const deleteDraftChapter = protectedProcedure
  .input(z.object({ id: z.string().cuid() }))
  .mutation(async ({ ctx, input }) => {
    let chapter;
    try {
      chapter = await ctx.prisma.chapter.findUniqueOrThrow({
        where: {
          id: input.id,
        },
        include: {
          owner: true,
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
    if (chapter.ownerId !== ctx.session.user.id) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You are not the owner of this chapter",
      });
    }
    if (chapter.publishedAt && chapter.publishedAt.getTime() < Date.now()) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "You can't delete a published chapter",
      });
    }
    try {
      return await ctx.prisma.chapter.delete({
        where: {
          id: input.id,
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

export default deleteDraftChapter;
