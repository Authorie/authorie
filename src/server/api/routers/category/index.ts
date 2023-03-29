import { createTRPCRouter, protectedProcedure } from "@server/api/trpc";
import followCategory from "./followCategory";
import getAllCategories from "./getAllCategories";
import unfollowCategory from "./unfollowCategory";

export const categoryRouter = createTRPCRouter({
  getAll: getAllCategories,
  getFollowed: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.prisma.categoriesOnUsers.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      select: {
        category: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
    return result.map((res) => res.category);
  }),
  follow: followCategory,
  unfollow: unfollowCategory,
});
