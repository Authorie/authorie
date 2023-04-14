const ChapterSkeleton = () => {
  return (
    <div className="relative max-w-5xl animate-pulse cursor-pointer overflow-hidden rounded-xl bg-white shadow-md">
      <div className="relative flex flex-col gap-1 px-8 py-4">
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-white via-white/60 to-transparent" />
        <div className="absolute inset-0">
          <div className="h-full w-full bg-authGreen-500"></div>
        </div>
        <div className="z-10">
          <div className="mb-3 h-8 w-72 rounded-full bg-slate-200"></div>
          <div className="mb-2 h-5 w-72 rounded-full bg-slate-200"></div>
          <div className="h-4 w-24 rounded-full bg-slate-200"></div>
        </div>
      </div>
      <div className="my-3 px-8">
        <div className="mb-3 h-4 w-40 rounded-full bg-slate-200"></div>
        <div className="h-24 w-full rounded-lg bg-slate-200" />
        <div className="z-10 flex items-center gap-16 pt-3">
          <div className="h-6 w-6 rounded-lg bg-slate-200"></div>
          <div className="h-6 w-6 rounded-lg bg-slate-200"></div>
        </div>
      </div>
    </div>
  );
};

export default ChapterSkeleton;
