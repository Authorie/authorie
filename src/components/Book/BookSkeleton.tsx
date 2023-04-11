const BookSkeleton = () => {
  return (
    <div className="flex animate-pulse">
      <div className="h-72 w-3 rounded-r-lg bg-authGreen-400 shadow-lg" />
      <div className="relative flex h-72 w-52 flex-col justify-between rounded-l-lg bg-white shadow-lg">
        <div className="mt-10 h-6 w-40 self-center rounded-full bg-slate-200"></div>
        <div className="mb-2 ml-2 h-5 w-20 rounded-full bg-slate-200"></div>
      </div>
    </div>
  );
};

export default BookSkeleton;
