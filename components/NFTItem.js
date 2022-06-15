import React from "react";
import Image from "next/image";
import { convertWeiToEther } from "../utils/web3";
import { timeLeft } from "../utils/utils";
import Router from "next/router";

const NFTItem = ({ nft }) => {
  return (
    <div
      onClick={() => Router.push(`/detail?id=${nft.tokenId}`)}
      className="flex flex-col border cursor-pointer shadow rounded-xl overflow-hidden bg-white transition ease-out hover:shadow-lg aspect-[3/4]"
    >
      <div className="flex h-full items-center">
        <img src={nft?.image} className="rounded object-contain w-full" />
      </div>
      <div className="p-3">
        <div className="flex justify-between">
          <div>
            <p className="text-xs font-base pr-1 text-gray-500">
              {nft?.isMultiToken ? "UITToken1155" : "UITToken721"}
            </p>
            <p className="text-xs font-semibold mt-0">{nft?.name}</p>
          </div>
          {nft?.bidded && nft?.sold ? (
            <></>
          ) : (
            <div className="flex flex-col items-end gap-1">
              <p className="text-xs font-thin">
                {nft?.bidded ? "Price" : "Min Bid"}
              </p>
              <div className="flex justify-end">
                <p className="text-xs font-semibold pr-1">
                  {nft?.bidded
                    ? nft?.price
                    : nft?.auctionInfo.highestBid.toString() !== "0"
                    ? convertWeiToEther(nft?.auctionInfo.highestBid)
                    : convertWeiToEther(nft?.auctionInfo.startingPrice)}
                </p>
                <Image
                  src="https://openseauserdata.com/files/6f8e2979d428180222796ff4a33ab929.svg"
                  alt="eth-icon"
                  height={8}
                  width={8}
                />
              </div>
              {nft.bidded ? (
                <div className="text-xs font-thin invisible">No</div>
              ) : (
                <div className="flex justify-end items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-xs font-thin">
                    {nft?.auctionInfo?.endAt
                      ? timeLeft(
                          new Date(
                            Date.now() +
                              parseInt(nft?.auctionInfo?.endAt.toString())
                          )
                        )
                      : ""}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NFTItem;
