import { BookOwnerStatus, Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const bookRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        invitees: z.array(z.string()).default([]),
      })
    )
    .query(async ({ ctx, input }) => {
      const { title, description, invitees } = input;
      try {
        const book = await ctx.prisma.book.create({
          data: {
            title,
            description,
            owners: {
              createMany: {
                data: [
                  {
                    userId: ctx.session.user.id,
                    status: BookOwnerStatus.OWNER,
                  },
                  ...invitees.map((invitee) => ({
                    userId: invitee,
                    status: BookOwnerStatus.INVITEE,
                  })),
                ],
              },
            },
          },
        });
        return book;
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          if (e.code === "P2003") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "user not found: " + invitees.join(", "),
              cause: e,
            });
          }
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "failed to create book",
          cause: e,
        });
      }
    }),
});
