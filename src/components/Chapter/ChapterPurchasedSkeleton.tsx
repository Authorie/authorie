const ChapterPurchasedSkeleton = () => {
  return (
    <div className="relative flex h-72 w-52 animate-pulse flex-col rounded-lg p-2 shadow-lg">
      <div className="h-5 w-16 rounded-lg bg-slate-300"></div>
      <div className="flex h-full flex-col justify-between">
        <div className="mt-3 flex flex-col items-center gap-2">
          <div className="my-1 h-4 w-44 rounded-lg bg-slate-300"></div>
          <div className="my-1 h-8 w-44 rounded-lg bg-slate-300"></div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="ml-1 h-5 w-40 rounded-lg bg-slate-300"></div>
          <div className="ml-1 flex items-center gap-4">
            <div className="h-4 w-12 rounded-lg bg-slate-300"></div>
            <div className="h-4 w-12 rounded-lg bg-slate-300"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChapterPurchasedSkeleton;
