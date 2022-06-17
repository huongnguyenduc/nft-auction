import { useEffect, useState } from "react";
import Image from "next/image";
import { getShortAddress } from "../utils/utils";
import Router from "next/router";
import NFTItem from "../components/NFTItem";
import { useWeb3React } from "@web3-react/core";
import { axiosFetcher } from "../utils/fetcher";

export default function MyAssets() {
  const [userData, setUserData] = useState();
  const { isActive, account: userAccount } = useWeb3React();
  useEffect(() => {
    async function getUser() {
      const userData = await axiosFetcher(`user/${userAccount}`);
      if (userData?.data) {
        setUserData(userData.data);
      }
    }
    if (!isActive) {
      Router.push(`/login?referrer=account`);
    } else {
      if (userAccount) {
        loadNFTs();
        getUser();
      }
    }
  }, [isActive]);
  const [nfts, setNfts] = useState([]);
  const [tabState, setTabState] = useState("collected");
  useEffect(() => {
    if (userAccount) {
      loadNFTs();
      setTabState("collected");
    }
  }, [userAccount]);
  async function loadNFTs() {
    if (userAccount) {
      const myNFTsResponse = await axiosFetcher(`user/${userAccount}/nfts`);
      setNfts(myNFTsResponse?.data ? myNFTsResponse?.data : []);
    }
  }

  const [listedNfts, setListedNfts] = useState([]);

  async function loadListedNFTs() {
    if (userAccount) {
      const listingNFTsResponse = await axiosFetcher(
        `user/${userAccount}/listing-nfts`
      );
      setListedNfts(listingNFTsResponse?.data ? listingNFTsResponse?.data : []);
    }
  }

  const [biddingNfts, setBiddingNfts] = useState([]);

  async function loadBiddingNFTs() {
    if (userAccount) {
      const bidNFTsResponse = await axiosFetcher(
        `user/${userAccount}/bidding-nfts`
      );
      setBiddingNfts(bidNFTsResponse?.data ? bidNFTsResponse?.data : []);
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-full h-[43vh] ${"bg-gray-100 hover:bg-gray-300 relative"}`}
      >
        {userData?.banner ? (
          <Image
            src={userData.banner}
            alt="user-banner"
            layout="fill"
            objectFit="cover"
          />
        ) : (
          <></>
        )}
        <div className="w-[180px] h-[180px] rounded-[180px] absolute bottom-[-30px] left-8 xl:left-16 bg-white shadow flex justify-center items-center">
          <div className="w-[168px] h-[168px] rounded-[168px] bg-gray-400 relative overflow-hidden">
            {userData?.image ? (
              <Image src={userData.image} alt="user-image" layout="fill" />
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>
      <div className="px-8 xl:px-16 pt-12 flex flex-col w-full">
        <p className="text-3xl font-semibold mb-2">
          {userData?.username ? userData?.username : "Unnamed"}
        </p>
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
        <div className="flex justify-center w-full pb-8">
          <div className="flex w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 pt-4 w-full">
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
