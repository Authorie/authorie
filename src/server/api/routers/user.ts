import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  followCategory: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      ctx.prisma.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          categories: {
            create: {
              categoryId: input,
            },
          },
        },
      });
    }),
});
