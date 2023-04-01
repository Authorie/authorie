import { NotificationActionType } from "@prisma/client";
import { protectedProcedure } from "@server/api/trpc";
import { z } from "zod";

const followUser = protectedProcedure
  .input(z.object({ id: z.string().cuid() }))
  .mutation(async ({ ctx, input }) => {
    const { id } = input;
    await ctx.prisma.$transaction([
      ctx.prisma.followingFollower.create({
        data: {
          follower: {
            connect: {
              id: ctx.session.user.id,
            },
          },
          following: {
            connect: { id },
          },
        },
      }),
      ctx.prisma.notificationObject.create({
        data: {
          actors: {
            create: {
              actor: {
                connect: {
                  id: ctx.session.user.id,
                },
              },
            },
          },
          viewers: {
            create: {
              viewer: {
                connect: { id },
              },
            },
          },
          action: NotificationActionType.USER_FOLLOW,
        },
      }),
    ]);
  });

export default followUser;
