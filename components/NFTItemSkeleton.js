import React from "react";

const NFTItemSkeleton = () => {
  return (
    <div className="flex animate-pulse flex-col border cursor-pointer shadow rounded-xl overflow-hidden bg-white transition ease-out hover:shadow-lg aspect-[3/4]">
      <div className="flex h-full bg-slate-400 items-center"></div>
      <div className="p-3">
        <div className="flex justify-between">
          <div>
            <p className="text-xs bg-slate-400 font-base pr-1 text-gray-500 h-2 w-10 rounded-lg"></p>
            <p className="text-xs bg-slate-400 font-base pr-1 text-gray-500 h-2 w-6 rounded-lg mt-1"></p>
          </div>
          <div className="flex flex-col items-end justify-center gap-1">
            <div className="h-2 w-6 rounded-lg bg-slate-400"></div>
            <div className="h-2 w-10 rounded-lg bg-slate-400"></div>
            <div className="h-2 w-14 rounded-lg bg-slate-400"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTItemSkeleton;
