import { publicProcedure } from "@server/api/trpc";

interface withUsers {
  users: {
    userId: string;
  }[];
}

type WithIsSubscribed<T extends withUsers> = Omit<T, "users"> & {
  isSubscribed: boolean;
};

export function computeIsSubscribed<Category extends withUsers>(
  userId: string | undefined,
  category: Category
): WithIsSubscribed<Category> {
  return {
    ...category,
    isSubscribed: category.users.some((user) => user.userId === userId),
  };
}

const getAllCategories = publicProcedure.query(async ({ ctx }) => {
  const categories = await ctx.prisma.category.findMany({
    include: {
      users: {
        where: { userId: ctx.session?.user.id || undefined },
      },
    },
  });

  return categories.map((category) =>
    computeIsSubscribed(ctx.session?.user.id, category)
  );
});

export default getAllCategories;
