import { z } from "zod";
import { publicProcedure } from "~/server/api/trpc";
import { makePagination } from "~/server/utils";

interface withFollowingFollower {
  following: {
    followingId: string;
  }[];
  followers: {
    followerId: string;
  }[];
}

type WithFollowingEachOther<T extends withFollowingFollower> = Omit<
  T,
  "following" | "followers"
> & {
  isFollowingEachOther: boolean;
};

export function computeIsFollowingEachOther<User extends withFollowingFollower>(
  userId: string | undefined,
  user: User
): WithFollowingEachOther<User> {
  return {
    ...user,
    following: undefined,
    followers: undefined,
    isFollowingEachOther:
      user.followers.some((follower) => follower.followerId === userId) &&
      user.following.some((following) => following.followingId === userId),
  };
}

const searchUsers = publicProcedure
  .input(
    z.object({
      search: z.string(),
      cursor: z.string().cuid().optional(),
      limit: z.number().int().min(1).max(10).default(5),
    })
  )
  .query(async ({ ctx, input }) => {
    const { search, limit, cursor } = input;
    const users = (
      await ctx.prisma.user.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        where: {
          penname: {
            contains: search,
          },
        },
        include: {
          followers: {
            select: {
              followerId: true,
            },
          },
          following: {
            select: {
              followingId: true,
            },
          },
          _count: {
            select: {
              followers: true,
              following: true,
            },
          },
        },
      })
    ).map((user) => computeIsFollowingEachOther(ctx.session?.user.id, user));
    return makePagination(users, limit);
  });

export default searchUsers;
