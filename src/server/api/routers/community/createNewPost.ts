import { z } from "zod";
import { protectedProcedure } from "../../trpc";

const createNewPost = protectedProcedure
  .input(
    z.object({
      title: z.string(),
      content: z.string(),
      image: z.string().url().optional(),
      parentId: z.string().cuid().optional(),
      authorPenname: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { title, content, image, parentId, authorPenname } = input;
    const author = await ctx.prisma.user.findFirstOrThrow({
      where: { penname: authorPenname },
    });
    const post = await ctx.prisma.communityPost.create({
      data: {
        title,
        image,
        content,
        parentId,
        authorId: author.id,
        userId: ctx.session.user.id,
      },
    });
    return post;
  });

export default createNewPost;
