import { BookOwnerStatus } from "@prisma/client";
import Image from "next/image";
import { HiCheckCircle, HiMinusCircle, HiXCircle } from "react-icons/hi2";

type props = {
  index: number;
  penname: string;
  status: string;
  image: string;
  isUserOwner: boolean;
  isBookOwner: boolean;
  isBookInitialStatus: boolean;
  onInvite: () => void;
  onRemove: () => void;
};

const AuthorCard = ({
  index,
  penname,
  status,
  image,
  isUserOwner,
  isBookOwner,
  isBookInitialStatus,
  onInvite,
  onRemove,
}: props) => {
  return (
    <li className="flex items-center py-3">
      <span className="w-4">{index}.</span>
      <div className="ml-5 flex w-64 items-center gap-4">
        <div className="relative h-8 w-8 overflow-hidden rounded-full">
          <Image src={image} alt={`${penname}'s profile picture`} fill />
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
          <span className="w-48">
            {status === BookOwnerStatus.INVITEE && "no response"}
            {status === BookOwnerStatus.REJECTED && "rejected"}
            {status === BookOwnerStatus.COLLABORATOR && "accepted"}
          </span>
        </div>
      )}
      <div className="grid grow grid-flow-col justify-end gap-2">
        {isBookOwner &&
          isBookInitialStatus &&
          status === BookOwnerStatus.REJECTED && (
            <button
              type="button"
              onClick={onInvite}
              className="border border-blue-400 px-4 py-1 text-sm text-blue-400 hover:bg-blue-400 hover:text-white"
            >
              invite
            </button>
          )}
        {isBookInitialStatus &&
          ((isBookOwner &&
            (status === BookOwnerStatus.COLLABORATOR ||
              status === BookOwnerStatus.INVITEE)) ||
            (isUserOwner && status !== BookOwnerStatus.OWNER)) && (
            <button
              type="button"
              onClick={onRemove}
              className="border border-red-400 px-4 py-1 text-sm text-red-400 hover:bg-red-400 hover:text-white"
            >
              remove
            </button>
          )}
      </div>
    </li>
  );
};

export default AuthorCard;
