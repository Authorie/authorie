const UserResultSkeleton = () => {
  return (
    <div className="flex animate-pulse items-center rounded bg-slate-50 px-4 shadow-lg">
      <div className="flex h-32 grow flex-col justify-between py-3">
        <div>
          <div className="mb-2 h-5 w-20 rounded-lg bg-slate-200"></div>
          <div className="mb-2 h-6 w-40 rounded-lg bg-slate-200"></div>
          <div className="h-4 w-96 rounded-lg bg-slate-200"></div>
        </div>
        <div className="flex gap-16 text-sm">
          <div className="h-4 w-20 rounded-lg bg-slate-200"></div>
          <div className="h-4 w-20 rounded-lg bg-slate-200"></div>
        </div>
      </div>
      <div className="h-20 w-20">
        <div className="overflow-hidden rounded-full">
          <div className="h-20 w-20 bg-slate-200" />
        </div>
      </div>
    </div>
  );
};

export default UserResultSkeleton;
