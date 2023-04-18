import { BookOwnerStatus } from "@prisma/client";
import Image from "next/image";
import { HiCheckCircle, HiMinusCircle, HiXCircle } from "react-icons/hi2";

type props = {
  index: number;
  penname: string;
  status: string;
  image: string;
  isBookInitialStatus: boolean;
  onInvite: () => void;
  onRemove: () => void;
};

const AuthorList = ({
  index,
  penname,
  status,
  image,
  isBookInitialStatus,
  onInvite,
  onRemove,
}: props) => {
  return (
    <li className="flex h-12 items-center">
      <span className="w-4">{index}.</span>
      <div className="ml-5 flex w-72 items-center gap-4">
        <div className="relative h-8 w-8 overflow-hidden rounded-full">
          <Image
            src={image}
            alt={`${penname}'s profile picture`}
            fill
          />
        </div>
        <span
          className={`${status === BookOwnerStatus.OWNER ? "font-semibold" : ""
            } ${isBookInitialStatus ? "w-52" : ""}`}
        >
          {penname}
        </span>
      </div>
      {isBookInitialStatus && (
        <div className="flex items-center gap-1">
          {status === BookOwnerStatus.COLLABORATOR && (
            <HiCheckCircle className="h-4 w-4 text-green-500" />
          )}
          {status === BookOwnerStatus.INVITEE && (
            <HiMinusCircle className="h-4 w-4 text-gray-500" />
          )}
          {status === BookOwnerStatus.REJECTED && (
            <HiXCircle className="h-4 w-4 text-red-500" />
          )}
          <span className="w-40">
            {status === BookOwnerStatus.INVITEE && "no response"}
            {status === BookOwnerStatus.REJECTED && "rejected"}
            {status === BookOwnerStatus.COLLABORATOR && "accepted"}
          </span>
        </div>
      )}
      {isBookInitialStatus &&
        status !== BookOwnerStatus.OWNER && (
          <div className="flex w-52 justify-end gap-2">
            {status !== BookOwnerStatus.COLLABORATOR && (
              <button
                type="button"
                onClick={onInvite}
                className="border border-blue-400 px-4 py-1 text-sm text-blue-400 hover:bg-blue-400 hover:text-white"
              >
                invite
              </button>
            )}
            {status !== BookOwnerStatus.REJECTED && (
              <button
                type="button"
                onClick={onRemove}
                className="border border-red-400 px-4 py-1 text-sm text-red-400 hover:bg-red-400 hover:text-white"
              >
                remove
              </button>
            )}
          </div>
        )}
    </li>
  );
};

export default AuthorList;
