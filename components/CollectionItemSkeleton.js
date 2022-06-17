const CollectionItemSkeleton = () => {
  return (
    <div className="w-full animate-pulse border hover:shadow-lg pb-[22px] rounded-xl overflow-hidden relative">
      <div className="h-[199px] bg-slate-400 w-full relative overflow-hidden"></div>
      <div className="mt-[-36px] w-full relative p-[10px]">
        <div className="flex justify-center">
          <div className="flex justify-center items-center w-[50px] h-[50px] rounded-[50px] bg-white border">
            <div className="h-[44px] w-[44px] bg-slate-400 rounded-[44px] relative overflow-hidden"></div>
          </div>
        </div>
        <div className="mt-8 w-full flex justify-center">
          <div className="h-full w-12 bg-slate-400 rounded-lg"></div>
        </div>
        <div className="mt-2 flex w-full justify-center">
          <div className="w-10 h-full bg-slate-400 rounded-lg"> </div>
        </div>
        <div className="mt-4 w-full flex justify-center">
          <p className="text-center max-w-[80%] text-base w-12 bg-slate-400 rounded-lg"></p>
        </div>
      </div>
    </div>
  );
};

export default CollectionItemSkeleton;
