import z from "zod";
import { publicProcedure } from "~/server/api/trpc";

const getAllPosts = publicProcedure
  .input(z.object({ penname: z.string() }))
  .query(({ ctx, input }) => {
    const { penname } = input;
    return ctx.prisma.communityPost.findMany({
      where: {
        author: {
          penname,
        },
        parentId: null,
      },
      select: {
        id: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  });

export default getAllPosts;
