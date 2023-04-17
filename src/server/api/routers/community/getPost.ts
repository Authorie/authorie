import z from "zod";
import { publicProcedure } from "../../trpc";

const getPost = publicProcedure.input(z.object({
  id: z.string().cuid(),
})).query(async ({ ctx, input }) => {
  const { id } = input;
  const post = await ctx.prisma.communityPost.findUniqueOrThrow({
    where: {
      id,
    },
    include: {
      user: {
        select: {
          id: true,
          penname: true,
          image: true,
        }
      },
      children: {
        select: {
          id: true,
        }
      },
      _count: true
    }
  });
  const isLike = ctx.session ? await ctx.prisma.communityPostLike.findUnique({
    where: {
      postId_userId: {
        postId: id,
        userId: ctx.session.user.id,
      }
    }
  }) : false;

  return {
    ...post,
    isLike,
  }
})

export default getPost