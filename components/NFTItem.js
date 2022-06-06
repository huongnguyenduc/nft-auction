import React from "react";
import Image from "next/image";
import { timeLeft, convertWeiToEther } from "../utils/utils";
import Router from "next/router";

const NFTItem = ({ nft }) => {
  return (
    <div
      onClick={() =>
        Router.push(
          `/detail?id=${nft.tokenId}&tokenURI=${nft.tokenUri}&isMultiToken=${nft.isMultiToken}`
        )
      }
      className="border cursor-pointer shadow rounded-xl overflow-hidden bg-white transition ease-out hover:shadow-lg hover:-translate-y-0.5"
    >
      <img src={nft.image} className="rounded" />
      <div className="p-3">
        <div className="flex justify-between">
          <p className="text-xs font-semibold">{nft.name}</p>
          {nft.bidded && nft.sold ? (
            <></>
          ) : (
            <div className="flex flex-col items-end gap-1">
              <p className="text-xs font-thin">
                {nft.bidded ? "Price" : "Min Bid"}
              </p>
              <div className="flex justify-end">
                <p className="text-xs font-semibold pr-1">
                  {nft.bidded
                    ? nft.price
                    : nft.auctionInfo.highestBid
                    ? convertWeiToEther(nft.auctionInfo.highestBid)
                    : convertWeiToEther(nft.auctionInfo.startingPrice)}
                </p>
                <Image
                  src="https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg"
                  alt="eth-icon"
                  height={8}
                  width={8}
                />
              </div>
              {nft.bidded ? (
                <></>
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
