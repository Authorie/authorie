import { BookOwnerStatus, BookStatus, Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const bookRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z.union([
        z.object({
          userId: z.string().uuid(),
          cursor: z.string().optional(),
          take: z.number().default(10),
        }),
        z.object({
          status: z
            .enum([
              BookStatus.INITIAL,
              BookStatus.DRAFT,
              BookStatus.PUBLISHED,
              BookStatus.ARCHIVED,
            ])
            .array()
            .default([
              BookStatus.INITIAL,
              BookStatus.DRAFT,
              BookStatus.PUBLISHED,
            ]),
          cursor: z.string().optional(),
          take: z.number().default(10),
        }),
      ])
    )
    .query(async ({ ctx, input }) => {
      if ("userId" in input) {
        const { userId, cursor, take } = input;
        const or: Prisma.BookWhereInput[] = [
          {
            status: {
              in: [BookStatus.PUBLISHED, BookStatus.COMPLETED],
            },
            owners: {
              some: {
                userId: userId,
              },
            },
          },
        ];
        if (ctx.session?.user) {
          or.push({
            status: {
              in: [BookStatus.INITIAL, BookStatus.DRAFT],
            },
            owners: {
              some: {
                userId: {
                  in: [ctx.session.user.id, userId],
                },
              },
            },
          });
        }
        return await ctx.prisma.book.findMany({
          where: { OR: or },
          cursor: cursor ? { id: cursor } : undefined,
          take
        });
      }
      if (!ctx.session?.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "not authenticated",
        });
      }
      return await ctx.prisma.book.findMany({
        where: {
          status: {
            in: input.status
          },
          owners: {
            some: {
              userId: ctx.session.user.id
            }
          }
        },
        cursor: input.cursor ? { id: input.cursor } : undefined,
        take: input.take,
      });
    }),
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
        return await ctx.prisma.book.create({
          data: {
            title,
            description,
            owners: {
              createMany: {
                data: [
                  {
                    userId: ctx.session.user.id,
                    status: BookOwnerStatus.OWNER
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
