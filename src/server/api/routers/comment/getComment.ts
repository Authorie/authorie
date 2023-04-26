import { z } from "zod";
import { publicProcedure } from "~/server/api/trpc";

const getComment = publicProcedure
  .input(z.object({ id: z.string().cuid() }))
  .query(async ({ ctx, input }) => {
    const { id } = input;
    return await ctx.prisma.chapterComment.findFirstOrThrow({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            penname: true,
            image: true,
          },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                penname: true,
                image: true,
              },
            },
            _count: {
              select: {
                likes: true,
                replies: true,
              },
            },
            likes: {
              where: {
                userId: ctx.session?.user.id,
              },
              select: {
                userId: true,
              },
            },
          },
        },
        likes: {
          where: {
            userId: ctx.session?.user.id,
          },
          select: {
            userId: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  });

export default getComment;
