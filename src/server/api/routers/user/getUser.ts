import { BookOwnerStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure } from "~/server/api/trpc";

const getUser = publicProcedure
  .input(z.string().optional())
  .query(async ({ ctx, input }) => {
    if (input === undefined && !ctx.session) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "user does not exist",
      });
    }

    const user = await ctx.prisma.user.findUniqueOrThrow({
      where: input ? { penname: input } : { id: ctx.session?.user.id },
      include: {
        _count: {
          select: {
            ownedChapters: true,
            followers: true,
            following: true,
            posts: true,
          },
        },
        ownedBooks: {
          where: {
            status: {
              in: [BookOwnerStatus.OWNER, BookOwnerStatus.COLLABORATOR]
            }
          },
          select: {
            book: {
              select: {
                chapters: {
                  select: {
                    _count: {
                      select: {
                        views: true,
                        likes: true,
                      }
                    }
                  }
                },
                _count: {
                  select: {
                    favoritees: true,
                  }
                }
              }
            }
          }
        }
      },
    })

    return user
  });

export default getUser;
