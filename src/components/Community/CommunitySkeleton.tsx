const CommunitySkeleton = () => {
  return (
    <div className="flex w-full flex-col rounded-xl bg-white px-6">
      <div className="flex w-full animate-pulse flex-col py-4">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 overflow-hidden rounded-full bg-slate-200"></div>
          <div className="h-7 w-44 rounded-lg bg-slate-200 font-semibold"></div>
        </div>
        <div className="flex flex-col gap-4 py-4">
          <div className="h-10 w-96 rounded-lg bg-slate-200 font-bold"></div>
          <div className="h-20 w-full rounded-lg bg-slate-200"></div>
        </div>
        <div className="mb-4 flex items-center gap-8">
          <div className="h-7 w-14 rounded-lg bg-slate-200"></div>
          <div className="h-7 w-14 rounded-lg bg-slate-200"></div>
        </div>
        <div className="h-9 w-full rounded-lg bg-slate-200"></div>
      </div>
    </div>
  );
};

export default CommunitySkeleton;
