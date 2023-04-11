const BookResultSkeleton = () => {
  return (
    <div className="flex animate-pulse items-center rounded bg-slate-50 px-4 shadow-lg">
      <div className="flex h-32 grow flex-col justify-between py-3">
        <div>
          <div className="mb-2 h-5 w-20 rounded-lg bg-slate-200"></div>
          <div className="mb-2 h-6 w-72 rounded-lg bg-slate-200"></div>
          <div className="flex gap-10">
            <div className="h-5 w-32 rounded-lg bg-slate-200"></div>
            <div className="h-5 w-32 rounded-lg bg-slate-200"></div>
          </div>
        </div>
        <div className="h-4 w-96 rounded-lg bg-slate-200"></div>
      </div>
      <div className="flex">
        <div className="h-28 w-2 bg-authGreen-300" />
        <div className="h-28 w-20 bg-authGreen-200" />
      </div>
    </div>
  );
};

export default BookResultSkeleton;
