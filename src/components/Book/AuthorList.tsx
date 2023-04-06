import { BookOwnerStatus, BookStatus } from "@prisma/client";
import Image from "next/image";
import { HiCheckCircle, HiMinusCircle, HiXCircle } from "react-icons/hi2";

type props = {
  userId: string;
  number: number;
  penname: string;
  status: string;
  authorPicture: string;
  bookStatus: string;
  onInvite: (penname: string) => void;
  onRemove: (id: string, penname: string) => void;
};

const AuthorList = ({
  userId,
  number,
  penname,
  status,
  authorPicture,
  bookStatus,
  onInvite,
  onRemove,
}: props) => {
  return (
    <div className="flex h-12 items-center">
      <p className="w-4">{number}.</p>
      <div className="ml-5 flex w-72 items-center gap-4">
        <div className="relative h-8 w-8 overflow-hidden rounded-full">
          <Image
            src={authorPicture}
            alt={`${penname}'s profile picture`}
            fill
          />
        </div>
        <p
          className={`${
            status === BookOwnerStatus.OWNER ? "font-semibold" : ""
          } ${bookStatus === BookStatus.INITIAL ? "w-52" : ""}`}
        >
          {penname}
        </p>
      </div>
      {bookStatus === BookStatus.INITIAL && (
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
          <p className="w-40">
            {status === BookOwnerStatus.INVITEE && "no response"}
            {status === BookOwnerStatus.REJECTED && "rejected"}
            {status === BookOwnerStatus.COLLABORATOR && "accepted"}
          </p>
        </div>
      )}
      {bookStatus === BookStatus.INITIAL &&
        status !== BookOwnerStatus.OWNER && (
          <div className="flex w-52 justify-end gap-2">
            {status !== "accept" && (
              <button
                type="button"
                onClick={() => onInvite(penname)}
                className="border border-blue-400 px-4 py-1 text-sm text-blue-400 hover:bg-blue-400 hover:text-white"
              >
                invite
              </button>
            )}
            <button
              type="button"
              onClick={() => onRemove(userId, penname)}
              className="border border-red-400 px-4 py-1 text-sm text-red-400 hover:bg-red-400 hover:text-white"
            >
              remove
            </button>
          </div>
        )}
    </div>
  );
};

export default AuthorList;
