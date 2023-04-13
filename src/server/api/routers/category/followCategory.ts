import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";

const followCategory = protectedProcedure
  .input(z.string().cuid())
  .mutation(async ({ ctx, input }) => {
    const category = await ctx.prisma.category.findUnique({
      where: {
        id: input,
      },
    });
    if (!category) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `category does not exist: ${input}`,
      });
    }

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
  });

export default followCategory;
