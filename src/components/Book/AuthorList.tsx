import Image from "next/image";
import {
  CheckCircleIcon,
  MinusCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";
import { BookStatus } from "@prisma/client";

type props = {
  userId: string;
  number: number;
  penname: string;
  status: string;
  authorPicture: string;
  bookStatus: string;
  onInvite: (id: string, penname: string) => void;
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
        <p className="w-52">{penname}</p>
      </div>
      <div className="flex items-center gap-1">
        {status === "accept" && (
          <CheckCircleIcon className="h-4 w-4 text-green-500" />
        )}
        {status === "not response" && (
          <MinusCircleIcon className="h-4 w-4 text-gray-500" />
        )}
        {status === "reject" && (
          <XCircleIcon className="h-4 w-4 text-red-500" />
        )}
        <p className="w-40">{status}</p>
      </div>
      {bookStatus === BookStatus.INITIAL && (
        <div className="flex w-52 justify-end gap-2">
          {status !== "accept" && (
            <button
              type="button"
              onClick={() => onInvite(userId, penname)}
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
