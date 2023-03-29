import { protectedProcedure } from "@server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const unfollowCategory = protectedProcedure
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
      await ctx.prisma.categoriesOnUsers.delete({
        where: {
          categoryId_userId: {
            categoryId: input,
            userId: ctx.session.user.id,
          },
        },
      });
    } catch (e) {
      console.error(e);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to unfollow category",
      });
    }
  });

export default unfollowCategory;
