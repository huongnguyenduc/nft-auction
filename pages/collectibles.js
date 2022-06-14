import React from "react";
import Router from "next/router";

const Collectibles = () => {
  return (
    <>
      <div className="w-full h-[220px]">
        <img
          src="https://lh3.googleusercontent.com/l8oHCZk1C7EsY4Up-84SzLRwBGrRCDh7Z5k8WDnWIU1749AFyGY-ULYvZ952vKUhOydLrbdZHwjr50ARrqE2kYPEMqwHhg72d1JthQ=s2500"
          alt="collectibles-banner"
          className="object-cover w-full h-full"
        />
      </div>
      <div className="text-center w-full mt-6 text-[40px] font-semibold">
        Explore Collectibles
      </div>
      <div className="flex justify-center">
        <div className="py-12 max-w-[1600px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-4 px-8">
            <div
              onClick={() => Router.push("/collections/1")}
              className="w-full border hover:shadow-lg pb-[22px] cursor-pointer"
            >
              <div className="h-[199px] w-full">
                <img
                  src="https://lh3.googleusercontent.com/qU32LVN6jUy-ObRFSh8L1ku1tMmcIX5q_WJ3jKuZuSobuBhAOOlP2jizKj9tot52c9P7D-9Aar-TyYDqv_aFeFHOzibbRcC86o32XA=h200"
                  alt="collection-banner"
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="mt-[-36px] w-full relative p-[10px]">
                <div className="flex justify-center">
                  <div className="flex justify-center items-center w-[50px] h-[50px] rounded-[50px] bg-white border">
                    <img
                      src="https://lh3.googleusercontent.com/BX7cWHwWFzo6FVh-Ql_qzFbXtADQgLLlpLOl3l9tS6hUPlgtGHgHn_E1FxiHXmzNlvig00ZEAk9uZU-tMPT2Fg=s100"
                      alt="collection-avatar"
                      className="h-[44px] w-[44px] rounded-[44px]"
                    />
                  </div>
                </div>
                <p className="mt-8 w-full text-center font-semibold text-base">
                  Autoglyphs
                </p>
                <div className="mt-4 w-full flex justify-center">
                  <p className="text-center max-w-[80%] text-base">
                    Autoglyphs are the first “on-chain” generative art on the
                    Ethereum blockchain. A completely self-con...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Collectibles;
