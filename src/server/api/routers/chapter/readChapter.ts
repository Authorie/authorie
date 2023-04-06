import { z } from "zod";
import { publicProcedure } from "~/server/api/trpc";

const readChapter = publicProcedure
  .input(z.object({ id: z.string().cuid() }))
  .mutation(async ({ ctx, input }) => {
    const identifier = ctx.session?.user.id || "anonymous";
    const { success } = await ctx.ratelimit.limit(identifier, {
      geo: { ip: ctx.ip },
    });
    if (!success) return;

    await ctx.prisma.chapterView.create({
      data: {
        chapterId: input.id,
        userId: ctx.session?.user.id,
      },
    });
  });

export default readChapter;
