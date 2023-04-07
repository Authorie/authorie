import { BookOwnerStatus } from "@prisma/client";

interface withOwners {
  owners: {
    status: BookOwnerStatus;
    user: {
      id: string;
    };
  }[];
}

type WithIsOwner<T> = T & {
  isOwner: boolean;
  isInvited: boolean;
  isCollborator: boolean;
  isRejected: boolean;
};

export function computeIsOwner<User extends withOwners>(
  userId: string | undefined,
  user: User
): WithIsOwner<User> {
  let isOwner = false;
  let isInvited = false;
  let isCollborator = false;
  let isRejected = false;
  if (userId) {
    for (const owner of user.owners) {
      if (owner.user.id === userId) {
        switch (owner.status) {
          case BookOwnerStatus.OWNER:
            isOwner = true;
            break;
          case BookOwnerStatus.INVITEE:
            isInvited = true;
            break;
          case BookOwnerStatus.COLLABORATOR:
            isCollborator = true;
            break;
          case BookOwnerStatus.REJECTED:
            isRejected = true;
            break;
        }
      }
    }
  }

  return {
    ...user,
    isOwner,
    isInvited,
    isCollborator,
    isRejected,
  };
}
