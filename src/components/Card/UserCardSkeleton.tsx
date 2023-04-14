const UserCardSkeleton = () => {
  return (
    <div className="w-full animate-pulse rounded-full bg-slate-100 px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 overflow-hidden rounded-full">
            <div className="h-20 w-20 bg-slate-200"></div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="h-5 w-28 rounded-lg bg-slate-200"></div>
            <div className="flex gap-32">
              <div className="h-4 w-20 rounded-lg bg-slate-200"></div>
              <div className="h-4 w-20 rounded-lg bg-slate-200"></div>
            </div>
          </div>
        </div>
        <div className="h-7 w-20 rounded-lg bg-slate-200"></div>
      </div>
    </div>
  );
};

export default UserCardSkeleton;
