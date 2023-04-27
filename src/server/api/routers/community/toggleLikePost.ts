import { z } from "zod";
import { protectedProcedure } from "../../trpc";

const toggleLikePost = protectedProcedure
  .input(
    z.object({
      postId: z.string().cuid(),
      like: z.boolean(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { postId, like } = input;
    if (like) {
      const like = await ctx.prisma.communityPostLike.create({
        data: {
          postId,
          userId: ctx.session.user.id,
        },
        include: {
          post: {
            select: {
              _count: {
                select: {
                  likes: true,
                },
              },
            },
          },
        },
      });
      return like;
    } else {
      const like = await ctx.prisma.communityPostLike.delete({
        where: {
          postId_userId: {
            postId,
            userId: ctx.session.user.id,
          },
        },
        include: {
          post: {
            select: {
              _count: {
                select: {
                  likes: true,
                },
              },
            },
          },
        },
      });
      return like;
    }
  });

export default toggleLikePost;
