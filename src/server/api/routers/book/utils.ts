import { BookOwnerStatus } from "@prisma/client";

interface owners {
  owners: {
    status: BookOwnerStatus;
    user: {
      id: string;
    };
  }[];
}

type WithIsOwner<T> = T & {
  isOwner: boolean;
};

export function computeIsOwner<User extends owners>(
  userId: string | undefined,
  user: User
): WithIsOwner<User> {
  return {
    ...user,
    isOwner: userId
      ? user.owners.some(
          (owner) =>
            owner.status === BookOwnerStatus.OWNER && owner.user.id === userId
        )
      : false,
  };
}
