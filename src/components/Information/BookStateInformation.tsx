const BookStateInformation = () => {
  return (
    <div className="flex w-[524px] flex-col items-start gap-12 text-gray-700">
      <div className="flex flex-col gap-2">
        <div className="w-full rounded-lg px-2 py-1">
          <span className="font-semibold">1. Initial</span> : Invite people{" "}
          <span className="text-xs">
            (Inviting other people only available in this state)
          </span>
        </div>
        <div className="flex items-center gap-2 px-2">
          <p>Click</p>
          <div className="flex h-8 w-32 items-center justify-center rounded-md bg-blue-500 text-sm font-semibold text-white">
            <p>Start Writing</p>
          </div>
          <p>to move to Draft state</p>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="w-full rounded-lg px-2 py-1">
          <span className="font-semibold">2. Draft</span> : Write as much as you
          want, <span className="font-semibold">no one will see it yet</span>.
        </div>
        <div className="flex items-center gap-2 px-2">
          <p>Click</p>
          <div className="flex h-8 w-32 items-center justify-center rounded-md bg-green-500 text-sm font-semibold text-white">
            <p>Publish</p>
          </div>
          <p>to move to Publish state</p>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="w-full rounded-lg px-2 py-1">
          <span className="font-semibold">3. Publish</span> : People can now see
          your content.
        </div>
        <div className="flex items-center gap-2 px-2">
          <p>Click</p>
          <div className="flex h-8 w-32 items-center justify-center rounded-md bg-gray-500 text-sm font-semibold text-white">
            <p>Complete</p>
          </div>
          <p>to move to Complete state</p>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="w-full rounded-lg px-2 py-1">
          <span className="font-semibold">4. Complete</span> : Your book has
          ended and{" "}
          <span className="font-semibold">
            no new chapters can be published anymore
          </span>
          .{" "}
          <span className="text-xs font-semibold text-red-500">
            (You cannot reverse this state, therefore think carefully)
          </span>
        </div>
        <div className="flex items-center gap-2 px-2">
          <p>Click</p>
          <div className="flex h-8 w-32 items-center justify-center rounded-md bg-red-500 text-sm font-semibold text-white">
            <p>Archive</p>
          </div>
          <p>to move to Archive state</p>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="w-full rounded-lg px-2 py-1">
          <span className="font-semibold">5. Archive</span> : People will not
          see your book, except for the people who already bought it.
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="w-full rounded-lg px-2 py-1">
          <span className="font-semibold">6. Delete</span> : Your book will be
          gone forever{" "}
          <span className="text-xs text-green-500">
            (delete only available in Initial and Draft state)
          </span>
        </div>
      </div>
    </div>
  );
};

export default BookStateInformation;
