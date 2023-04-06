import { protectedProcedure } from "@server/api/trpc";
import { z } from "zod";

const getBookCollaborators = protectedProcedure
  .input(z.object({ bookId: z.string().cuid() }))
  .query(async ({ ctx, input }) => {
    const { bookId } = input;
    return await ctx.prisma.bookOwner.findMany({
      where: {
        bookId,
      },
      include: {
        user: {
          select: {
            id: true,
            penname: true,
            image: true,
          },
        },
      },
    });
  });

export default getBookCollaborators;
