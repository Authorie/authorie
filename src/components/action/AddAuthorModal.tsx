import type { User } from "@prisma/client";
import { useSession } from "next-auth/react";
import Image from "next/image";
import useSearch from "~/hooks/search";
import { api } from "~/utils/api";

type props = {
  toogleCollaboratorsHandler: (collaborator: User) => void;
  addedCollaborators: User[];
};

export const AddAuthorModal = ({
  toogleCollaboratorsHandler,
  addedCollaborators,
}: props) => {
  const { data: session } = useSession();
  const { searchTerm, searchTermChangeHandler } = useSearch();
  const { data: users } = api.search.searchUsers.useQuery({
    search: searchTerm,
    limit: 3,
  });

  return (
    <div className="flex w-fit flex-col items-start justify-center rounded-xl bg-gray-200 p-2 pt-0">
      <div className="max-h-52 overflow-y-scroll border-b-2 border-gray-300 pt-2">
        <div className="h-fit">
          {users &&
            users.items.map((normalUser) => (
              <div
                key={normalUser.id}
                className="mb-2 flex w-72 items-center justify-between rounded-lg bg-white p-2 shadow-md"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full">
                    <Image
                      src={`${normalUser.image ?? "/placeholder_profile.png"}`}
                      alt="user profile"
                      width={30}
                      height={30}
                    />
                  </div>
                  <h1 className="font-bold">{normalUser.penname}</h1>
                </div>
                {normalUser.id !== session?.user.id &&
                  normalUser.isFollowingEachOther &&
                  !addedCollaborators.some((e) => e.id === normalUser.id) && (
                    <button
                      type="button"
                      onClick={() => toogleCollaboratorsHandler(normalUser)}
                      className="rounded-full bg-authGreen-500 px-3 py-1 text-xs font-semibold text-white hover:bg-authGreen-600"
                    >
                      Add
                    </button>
                  )}
                {addedCollaborators.some((e) => e.id === normalUser.id) && (
                  <button
                    type="button"
                    onClick={() => toogleCollaboratorsHandler(normalUser)}
                    className="group/added-user rounded-full bg-gray-500 px-3 py-1 text-xs font-semibold text-white hover:bg-red-600"
                  >
                    <p className="block group-hover/added-user:hidden">Added</p>
                    <p className="hidden group-hover/added-user:block">
                      Remove
                    </p>
                  </button>
                )}
                {normalUser.id !== session?.user.id &&
                  !normalUser.isFollowingEachOther && (
                    <button
                      disabled
                      className="rounded-full bg-gray-500 px-3 py-1 text-xs font-bold text-white"
                    >
                      -
                    </button>
                  )}
              </div>
            ))}
        </div>
      </div>
      <input
        type="text"
        className="focus:shadow-outline mt-2 w-72 rounded-lg bg-white px-3 py-2 text-xs focus:outline-none"
        placeholder="Enter author's pen name..."
        onChange={searchTermChangeHandler}
      />
    </div>
  );
};
