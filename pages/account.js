import { useEffect, useState } from "react";
import Image from "next/image";
import { getShortAddress } from "../utils/utils";
import { useWeb3React } from "@web3-react/core";
import Router from "next/router";
import { axiosFetcher } from "../utils/fetcher";
import NFTItem from "../components/NFTItem";

export default function MyAssets() {
  const { isActive, account: userAccount } = useWeb3React();
  useEffect(() => {
    if (!isActive) {
      Router.push(`/login?referrer=account`);
    } else {
      loadNFTs();
    }
  }, [isActive]);
  const [nfts, setNfts] = useState([]);
  const [tabState, setTabState] = useState("collected");
  useEffect(() => {
    loadNFTs();
    setTabState("collected");
  }, [userAccount]);
  async function loadNFTs() {
    const myNFTsResponse = await axiosFetcher(`nft/user/${userAccount}`);
    setNfts(myNFTsResponse?.data?.nfts ? myNFTsResponse?.data?.nfts : []);
  }

  const [listedNfts, setListedNfts] = useState([]);

  async function loadListedNFTs() {
    const listingNFTsResponse = await axiosFetcher(
      `nft/user/${userAccount}/listing`
    );
    setListedNfts(
      listingNFTsResponse?.data?.nfts ? listingNFTsResponse?.data?.nfts : []
    );
  }

  const [biddingNfts, setBiddingNfts] = useState([]);

  async function loadBiddingNFTs() {
    const bidNFTsResponse = await axiosFetcher(
      `nft/user/${userAccount}/bidding-auction`
    );
    setBiddingNfts(
      bidNFTsResponse?.data?.nfts ? bidNFTsResponse?.data?.nfts : []
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-full h-[43vh] ${"bg-gray-100 hover:bg-gray-300 relative"}`}
      >
        <div className="w-[180px] h-[180px] rounded-[180px] absolute bottom-[-30px] left-8 xl:left-16 bg-white shadow flex justify-center items-center">
          <div className="w-[168px] h-[168px] rounded-[168px] bg-gray-400"></div>
        </div>
      </div>
      <div className="px-8 xl:px-16 pt-12 flex flex-col w-full">
        <p className="text-3xl font-semibold mb-2">Unnamed</p>
        <div className="flex gap-2 mb-4">
          <Image
            src="https://openseauserdata.com/files/6f8e2979d428180222796ff4a33ab929.svg"
            alt="eth-icon"
            height={10}
            width={10}
          />
          <p className="text-base">{getShortAddress(userAccount)}</p>
        </div>
        <div className="flex gap-12 py-5">
          <div
            onClick={() => {
              setTabState("collected");
              loadNFTs();
            }}
            className={`flex ${
              tabState === "collected" ? "border-b-2" : "text-gray-500"
            } border-black items-center pb-2 cursor-pointer`}
          >
            <p className="font-semibold text-lg">Collected</p>
            <p className="text-lg font-normal mt-0 ml-2">
              {nfts.length > 0 ? nfts.length : ""}
            </p>
          </div>
          <div
            onClick={() => {
              setTabState("onSale");
              loadListedNFTs();
            }}
            className={`flex ${
              tabState === "onSale" ? "border-b-2" : "text-gray-500"
            } border-black items-center pb-2 cursor-pointer`}
          >
            <p className="font-semibold text-lg">On sale</p>
            <p className="text-lg font-normal mt-0 ml-2">
              {listedNfts.length > 0 ? listedNfts.length : ""}
            </p>
          </div>
          <div
            onClick={() => {
              setTabState("bidding");
              loadBiddingNFTs();
            }}
            className={`flex ${
              tabState === "bidding" ? "border-b-2" : "text-gray-500"
            } border-black items-center pb-2 cursor-pointer`}
          >
            <p className="font-semibold text-lg">Bidding</p>
            <p className="text-lg font-normal mt-0 ml-2">
              {biddingNfts.length > 0 ? biddingNfts.length : ""}
            </p>
          </div>
        </div>
        <div className="flex justify-center">
          <div className="flex">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 pt-4">
              {tabState === "collected" ? (
                nfts.map((nft, i) => (
                  <NFTItem nft={nft} key={nft.toString() + i.toString()} />
                ))
              ) : (
                <></>
              )}
              {tabState === "onSale" ? (
                listedNfts.map((nft, i) => (
                  <NFTItem nft={nft} key={nft.toString() + i.toString()} />
                ))
              ) : (
                <></>
              )}
              {tabState === "bidding" ? (
                biddingNfts.map((nft, i) => (
                  <NFTItem nft={nft} key={nft.toString() + i.toString()} />
                ))
              ) : (
                <></>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
