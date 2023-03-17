import { useSession } from "next-auth/react";
import Image from "next/image";

const CommentInput = () => {
  const { data: session } = useSession();

  return (
    <>
      {session && (
        <div className="mt-1 flex items-center gap-3 rounded-xl bg-white py-1 pl-3 pr-1">
          <div className="h-8 w-8 overflow-hidden rounded-full">
            <Image
              src={session?.user.image || ""}
              alt="user's profile image"
              width={50}
              height={50}
            />
          </div>
          <input
            className="grow rounded-full bg-gray-200 px-4 py-1 text-sm outline-none focus:outline-none"
            placeholder="write comment here"
          />
        </div>
      )}
    </>
  );
};

export default CommentInput;
