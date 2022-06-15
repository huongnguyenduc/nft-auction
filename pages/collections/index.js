import React from "react";
import Router from "next/router";
import Image from "next/image";

const Collections = () => {
  return (
    <div className="flex justify-center">
      <div className="w-5/6 flex flex-col py-12">
        <p className="text-4xl font-semibold mb-4">My Collections</p>
        <p className="text-base mb-4">
          Create, curate, and manage collections of unique NFTs to share and
          sell.
        </p>
        <button
          onClick={() => Router.push("/collections/create")}
          className="font-semibold bg-blue-500 hover:bg-blue-400 transition ease-in text-white text-base rounded-xl px-6 py-4 w-fit mb-4"
        >
          Create a collection
        </button>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
          <div
            onClick={() => Router.push("/collections/1")}
            className="w-full border hover:shadow-lg pb-[22px] cursor-pointer"
          >
            <div className="h-[199px] w-full relative">
              <Image
                layout="fill"
                objectFit="cover"
                src="https://lh3.googleusercontent.com/qU32LVN6jUy-ObRFSh8L1ku1tMmcIX5q_WJ3jKuZuSobuBhAOOlP2jizKj9tot52c9P7D-9Aar-TyYDqv_aFeFHOzibbRcC86o32XA=h200"
                alt="collection-banner"
              />
            </div>
            <div className="mt-[-36px] w-full relative p-[10px]">
              <div className="flex justify-center">
                <div className="flex justify-center items-center w-[50px] h-[50px] rounded-[50px] bg-white border">
                  <div className="h-[44px] w-[44px] rounded-[44px] relative overflow-hidden">
                    <Image
                      layout="fill"
                      src="https://lh3.googleusercontent.com/BX7cWHwWFzo6FVh-Ql_qzFbXtADQgLLlpLOl3l9tS6hUPlgtGHgHn_E1FxiHXmzNlvig00ZEAk9uZU-tMPT2Fg=s100"
                      alt="collection-avatar"
                    />
                  </div>
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
  );
};

export default Collections;
