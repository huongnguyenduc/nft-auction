import React from "react";

function NFTDetail() {
  return (
    <>
      <div className="sticky bg-blue-50">
        <div className="flex justify-center">
          <div className="w-3/4 flex py-2 justify-end">
            <button
              type="button"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-16 py-4 mr-2"
            >
              Sell
            </button>
          </div>
        </div>
      </div>
      <div className="flex justify-center w-full">
        <div className="w-2/3 flex flex-col py-12"></div>
      </div>
    </>
  );
}

export default NFTDetail;
