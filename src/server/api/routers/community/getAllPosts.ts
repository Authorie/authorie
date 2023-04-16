import z from "zod"
import { publicProcedure } from "~/server/api/trpc"


const getAllPosts = publicProcedure.input(z.object({ penname: z.string().cuid() })).query(({ ctx, input }) => {
  const { penname } = input
  return ctx.prisma.user.findFirstOrThrow({
    where: { penname },
    select: {
      communityPosts: {
        include: {
          user: true,
          children: true,
          _count: {
            select: {
              likes: true,
              children: true,
            }
          }
        }
      }
    }
  })
})

export default getAllPosts 