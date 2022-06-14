import React from "react";

const Collection = () => {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-full h-[43vh] ${"bg-gray-100 hover:bg-gray-300 relative"}`}
      >
        <div className="w-[180px] h-[180px] rounded-lg absolute bottom-[-30px] left-8 bg-white shadow flex justify-center items-center">
          <div className="w-[168px] h-[168px] rounded-lg bg-gray-400"></div>
        </div>
      </div>
      <div
        className="px-8 pt-12 flex flex-col w-full"
        style={{ maxWidth: "1600px" }}
      >
        <p className="text-3xl font-semibold mb-2">UITToken721 - hH9KLeZWWN</p>
        <p className="text-base">
          Welcome to the home of UITToken721 - hH9KLeZWWN on OpenSea. Discover
          the best items in this collection.
        </p>
        <div className="flex justify-center">
          <div className="flex max-w-[1440px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Collection;
