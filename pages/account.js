import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { getShortAddress } from "../utils/utils";
import Router, { useRouter } from "next/router";
import NFTItem from "../components/NFTItem";
import { useWeb3React } from "@web3-react/core";
import { axiosFetcher } from "../utils/fetcher";
import NFTItemSkeleton from "../components/NFTItemSkeleton";
import LoadingPage from "../components/Loading";
import useSWRInfinite from "swr/infinite";
const PAGE_SIZE = 6;
export default function MyAssets() {
  const [userData, setUserData] = useState();
  const router = useRouter();
  const { address } = router.query;
  const { isActive, account: userAccount } = useWeb3React();
  useEffect(() => {
    async function getUser() {
      let userData;
      if (address) userData = await axiosFetcher(`user/${address}`);
      else userData = await axiosFetcher(`user/${userAccount}`);
      if (userData?.data) {
        setUserData(userData.data);
      }
    }
    if (!isActive && !address) {
      Router.push(`/login?referrer=account`);
    } else {
      if (userAccount) {
        getUser();
      }
    }
  }, [isActive, userAccount, address]);
  const [tabState, setTabState] = useState("nfts");
  const { data, error, size, setSize } = useSWRInfinite(
    (index) => [
      `user/${address ? address : userAccount}/${tabState}?pageNumber=${
        index + 1
      }&pageSize=${PAGE_SIZE}`,
    ],
    axiosFetcher
  );

  const nfts = data
    ? [].concat(...data?.map((response) => response?.data))
    : [];
  const isLoadingInitialData = !data && !error;
  const isLoadingMore =
    isLoadingInitialData ||
    (size > 0 && data && typeof data[size - 1] === "undefined");
  const isEmpty = data?.[0].data?.length === 0;
  const hasNoMore =
    isEmpty || (data && data?.[0]?.pagination?.total === nfts?.length);
  useEffect(() => {
    window.addEventListener("scroll", reachEndCallback, false);
    return () => {
      window.removeEventListener("scroll", reachEndCallback, false);
    };
  }, [hasNoMore]);
  function reachEnd() {
    if (
      window.innerHeight + window.scrollY >= document.body.offsetHeight &&
      !hasNoMore
    ) {
      setSize((size) => size + 1);
    }
  }
  const reachEndCallback = useCallback(() => {
    reachEnd();
  }, [hasNoMore]);

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
              setTabState("nfts");
            }}
            className={`flex ${
              tabState === "nfts" ? "border-b-2" : "text-gray-500"
            } border-black items-center pb-2 cursor-pointer`}
          >
            <p className="font-semibold text-lg">Collected</p>
            {/* <p className="text-lg font-normal mt-0 ml-2">
              {nfts.length > 0 ? nfts.length : ""}
            </p> */}
          </div>
          <div
            onClick={() => {
              setTabState("listing-nfts");
            }}
            className={`flex ${
              tabState === "listing-nfts" ? "border-b-2" : "text-gray-500"
            } border-black items-center pb-2 cursor-pointer`}
          >
            <p className="font-semibold text-lg">On sale</p>
            {/* <p className="text-lg font-normal mt-0 ml-2">
              {listedNfts.length > 0 ? listedNfts.length : ""}
            </p> */}
          </div>
          <div
            onClick={() => {
              setTabState("bidding-nfts");
            }}
            className={`flex ${
              tabState === "bidding-nfts" ? "border-b-2" : "text-gray-500"
            } border-black items-center pb-2 cursor-pointer`}
          >
            <p className="font-semibold text-lg">Bidding</p>
            {/* <p className="text-lg font-normal mt-0 ml-2">
              {biddingNfts.length > 0 ? biddingNfts.length : ""}
            </p> */}
          </div>
        </div>
        <div className="flex justify-center w-full pb-8">
          <div className="flex w-full">
            {isLoadingInitialData ? (
              <div className="w-full flex-1 flex justify-center items-center overflow-hidden py-12">
                <LoadingPage />
              </div>
            ) : isEmpty || (nfts && nfts.length === 0) ? (
              <div className="w-full flex-1 h-[60vh] flex flex-col gap-4 justify-center items-center py-12">
                <p className="text-xl md:text-2xl text-gray-600 items-center">
                  No items to display
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-8 w-full">
                {nfts && nfts.length > 0 ? (
                  nfts.map((nft, i) => (
                    <NFTItem key={nft.image + i} nft={nft} />
                  ))
                ) : (
                  <></>
                )}
                {hasNoMore ? (
                  <></>
                ) : isLoadingMore ? (
                  <>
                    <NFTItemSkeleton />
                    <NFTItemSkeleton />
                    <NFTItemSkeleton />
                    <NFTItemSkeleton />
                    <NFTItemSkeleton />
                    <NFTItemSkeleton />
                  </>
                ) : (
                  <></>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
