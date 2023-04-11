const ChapterResultSkeleton = () => {
  return (
    <div className="flex animate-pulse items-center rounded bg-slate-50 px-4 shadow-lg">
      <div className="flex h-32 grow flex-col justify-between py-3">
        <div>
          <div className="mb-2 h-5 w-20 rounded-lg bg-slate-200"></div>
          <div className="mb-2 h-6 w-72 rounded-lg bg-slate-200"></div>
          <div className="flex gap-10">
            <div className="h-4 w-24 rounded-lg bg-slate-200"></div>
            <div className="h-4 w-20 rounded-lg bg-slate-200"></div>
            <div className="h-4 w-24 rounded-lg bg-slate-200"></div>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="h-4 w-12 rounded-lg bg-slate-200"></div>
          <div className="h-4 w-12 rounded-lg bg-slate-200"></div>
        </div>
      </div>
    </div>
  );
};

export default ChapterResultSkeleton;
