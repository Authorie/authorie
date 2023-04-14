const BookStateInformation = () => {
  return (
    <div className="flex w-[524px] flex-col items-start gap-8 text-gray-700">
      <div className="w-full rounded-lg px-2 py-4">
        <span className="font-semibold">1. Initial</span> : Invite people{" "}
        <span className="text-xs">
          (Inviting other people only available in this state)
        </span>
      </div>
      <div className="w-full rounded-lg px-2 py-4">
        <span className="font-semibold">2. Draft</span> : Write as much as you
        want, <span className="font-semibold">no one will see it yet</span>.
      </div>
      <div className="w-full rounded-lg px-2 py-4">
        <span className="font-semibold">3. Publish</span> : People can now see
        your content.
      </div>
      <div className="w-full rounded-lg px-2 py-4">
        <span className="font-semibold">4. Complete</span> : Your book has ended
        and{" "}
        <span className="font-semibold">
          no new chapters can be published anymore
        </span>
        .{" "}
        <span className="text-xs font-semibold text-red-500">
          (You cannot reverse this state, therefore think carefully)
        </span>
      </div>
      <div className="w-full rounded-lg px-2 py-4">
        <span className="font-semibold">5. Archive</span> : People will not see
        your book, except for the people who already bought it.
      </div>
      <div className="w-full rounded-lg px-2 py-4">
        <span className="font-semibold">6. Delete</span> : Your book will be
        gone forever{" "}
        <span className="text-xs text-green-500">
          (delete only available in Initial and Draft state)
        </span>
      </div>
    </div>
  );
};

export default BookStateInformation;
