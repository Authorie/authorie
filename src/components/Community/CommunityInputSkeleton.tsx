const CommunityInputSkeleton = () => {
  return (
    <div className="flex w-[672px] flex-col rounded-xl bg-white px-6">
      <div className="flex w-full animate-pulse flex-col gap-4 py-4">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 overflow-hidden rounded-full bg-slate-200"></div>
          <div className="h-7 w-44 rounded-lg bg-slate-200 font-semibold"></div>
        </div>
        <div className="h-36 w-full rounded-lg bg-slate-200"></div>
        <div className="h-9 w-[70px] self-end rounded-lg bg-slate-200"></div>
      </div>
    </div>
  );
};

export default CommunityInputSkeleton;
