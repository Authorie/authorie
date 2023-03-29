import type { ChangeEvent } from "react";
import { useState } from "react";
import Image from "next/image";
import type { User } from "@prisma/client";
import useSearch from "@hooks/search";
import { api } from "@utils/api";

type props = {
  collaborators: User[];
  onClickHandler: (collaborator: User) => void;
};

export const AddAuthorModal = ({ collaborators, onClickHandler }: props) => {
  const [authorPenName, setAuthorPenName] = useState("");

  const { searchTerm, searchTermChangeHandler } = useSearch();
  const { data: users } = api.search.searchUsers.useQuery({
    search: searchTerm,
    limit: 3,
  });

  return (
    <div className="flex w-fit flex-col items-start justify-center rounded-xl bg-gray-200 p-2 pt-0">
      <div className="max-h-52 overflow-y-scroll border-b-2 border-gray-300 pt-2">
        <div className="h-fit">
          {collaborators.map((collaborator) => (
            <div
              key={collaborator.id}
              className="mb-2 flex w-72 items-center justify-between rounded-lg bg-white p-2 shadow-md"
            >
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center overflow-hidden rounded-full">
                  <Image
                    src="/mockWallpaper.jpeg"
                    alt="user profile"
                    width={40}
                    height={40}
                  />
                </div>
                <h1 className="font-bold">{collaborator.penname}</h1>
              </div>
              <button
                onClick={() => onClickHandler(collaborator)}
                className="rounded-full bg-authGreen-500 px-3 py-1 text-xs font-semibold text-white hover:bg-authGreen-600"
              >
                Add
              </button>
            </div>
          ))}
        </div>
      </div>
      <input
        type="text"
        className="focus:shadow-outline mt-2 w-72 rounded-lg bg-white py-2 px-3 text-xs focus:outline-none"
        placeholder="Enter author's pen name..."
        onChange={searchTermChangeHandler}
      />
    </div>
  );
};
