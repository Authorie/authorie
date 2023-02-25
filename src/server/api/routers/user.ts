import { z } from "zod";
import { Prisma } from "@prisma/client";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const userRouter = createTRPCRouter({
  update: protectedProcedure
    .input(
      z.object({
        penname: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const user = await ctx.prisma.user.update({
          where: {
            id: ctx.session.user.id,
          },
          data: input,
        });
        return user;
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          if (e.code === "P2002" && input.penname) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `penname already taken: ${input.penname}`,
              cause: e,
            });
          }
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "something went wrong",
          cause: e,
        });
      }
    }),
});
