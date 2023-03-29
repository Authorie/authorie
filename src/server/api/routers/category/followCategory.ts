import { protectedProcedure } from "@server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const followCategory = protectedProcedure
  .input(z.string().cuid())
  .mutation(async ({ ctx, input }) => {
    const category = await ctx.prisma.category.findUnique({
      where: {
        id: input,
      },
    });
    if (category === null) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `category does not exist: ${input}`,
      });
    }

    try {
      await ctx.prisma.categoriesOnUsers.upsert({
        where: {
          categoryId_userId: {
            categoryId: input,
            userId: ctx.session.user.id,
          },
        },
        create: {
          userId: ctx.session.user.id,
          categoryId: input,
        },
        update: {},
      });
    } catch (e) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `error following category: ${category.title}`,
        cause: e,
      });
    }
  });

export default followCategory;
