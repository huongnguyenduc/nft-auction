import { useState, useEffect, useCallback } from "react";
import { SelectPicker } from "rsuite";
import NFTItem from "../components/NFTItem";
import styles from "../components/Assets/Assets.module.css";
import { axiosFetcher } from "../utils/fetcher";
import LoadingPage from "../components/Loading";
import useSWRInfinite from "swr/infinite";
import NFTItemSkeleton from "../components/NFTItemSkeleton";
import Router, { useRouter } from "next/router";

const PAGE_SIZE = 8;

export default function Home() {
  const router = useRouter();
  const { query } = router.query;
  const [isBuying, setIsBuying] = useState(true);
  const [isOnAuction, setIsOnAuction] = useState(true);
  const auctionQuery = isOnAuction ? "&bidded=false" : "&bidded=true";
  const buyQuery = isBuying ? "&sold=false" : "&sold=true";
  const { data, error, size, setSize } = useSWRInfinite(
    (index) => [
      `nft?pageNumber=${
        index + 1
      }&pageSize=${PAGE_SIZE}${auctionQuery}${buyQuery}${
        query ? "&name=" + query : ""
      }`,
    ],
    axiosFetcher
  );

  const nfts =
    !isBuying && !isOnAuction
      ? []
      : data
      ? [].concat(...data?.map((response) => response?.data))
      : [];
  const isLoadingInitialData = !data && !error;
  const isLoadingMore =
    isLoadingInitialData ||
    (size > 0 && data && typeof data[size - 1] === "undefined");
  const isEmpty = data?.[0].data?.length === 0;
  const hasNoMore =
    isEmpty || (data && data?.[0]?.pagination?.total === nfts?.length);
  const [isOpenFilter, setIsOpenFilter] = useState(true);
  const toggleFilter = () => setIsOpenFilter((state) => !state);
  const [isMoreGrid, setIsMoreGrid] = useState(false);
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
    <>
      <div className="sticky z-[1050] w-full px-8 border-b top-[72px] bg-white h-[65px] flex justify-between items-center">
        <div
          onClick={toggleFilter}
          className="p-3 rounded-[50%] hover:shadow-lg cursor-pointer flex justify-center items-center"
        >
          <svg
            className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiSvgIcon-root MuiSvgIcon-fontSizeLarge css-1shn170"
            focusable="false"
            width="24"
            height="24"
            aria-hidden="true"
            viewBox="0 0 24 24"
            data-testid="FilterListIcon"
            tabIndex="-1"
            title="FilterList"
          >
            <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"></path>
          </svg>
        </div>
        <div className="flex items-center h-full gap-4">
          <SelectPicker
            className={styles.customSelectPicker}
            data={[{ label: "Recently Listed", value: "Listed" }]}
            searchable={false}
            placeholder="Sort by"
            style={{ width: 224 }}
            size="lg"
          />
          <div className="flex border-2 rounded-lg">
            <div
              onClick={() => {
                setIsMoreGrid(false);
              }}
              className={`p-[12px]  border-r-2${
                !isMoreGrid ? " bg-gray-100" : " cursor-pointer hover:shadow-lg"
              }`}
            >
              <svg
                className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiSvgIcon-root MuiSvgIcon-fontSizeLarge css-1shn170"
                focusable="false"
                aria-hidden="true"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                data-testid="WindowIcon"
                tabIndex="-1"
                title="Window"
              >
                <path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 9h-7V4h7v7zm-9-7v7H4V4h7zm-7 9h7v7H4v-7zm9 7v-7h7v7h-7z"></path>
              </svg>
            </div>
            <div
              onClick={() => {
                setIsMoreGrid(true);
              }}
              className={`p-[12px]${
                isMoreGrid ? " bg-gray-100" : " cursor-pointer hover:shadow-lg"
              }`}
            >
              <svg
                className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiSvgIcon-root MuiSvgIcon-fontSizeLarge css-1shn170"
                focusable="false"
                aria-hidden="true"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                data-testid="GridOnIcon"
                tabIndex="-1"
                title="GridOn"
              >
                <path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM8 20H4v-4h4v4zm0-6H4v-4h4v4zm0-6H4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-center h-full">
        <div className="flex w-full px-8">
          <div
            className={`w-[180px] lg:w-[240px] xl:w-[300px] pt-4 pr-4 mr-4 border-r sticky top-[137px] h-[calc(100vh-72px-65px-52px)] ${
              isOpenFilter ? "" : "hidden"
            }`}
          >
            <p className="text-base font-semibold px-2 py-4">Status</p>
            <div className="flex flex-col gap-1">
              <div
                onClick={() => setIsOnAuction((prevState) => !prevState)}
                className="flex justify-between items-center h-[48px] hover:bg-gray-100 rounded-xl px-2 py-4 cursor-pointer"
              >
                <p className="text-base text-gray-600 font-base">Buy Now</p>
                <input
                  type="checkbox"
                  className="h-6 w-6 cursor-pointer rounded-md"
                  checked={!isOnAuction}
                />
              </div>
              <div
                onClick={() => setIsBuying((prevState) => !prevState)}
                className="flex justify-between items-center h-[48px] hover:bg-gray-100 rounded-xl px-2 py-4 cursor-pointer"
              >
                <p className="text-base text-gray-600 font-base">On Auction</p>
                <input
                  type="checkbox"
                  className="h-6 w-6 cursor-pointer rounded-md"
                  checked={!isBuying}
                />
              </div>
            </div>
          </div>
          {isLoadingInitialData ? (
            <div className="w-full flex-1 flex justify-center items-center overflow-hidden py-12">
              <LoadingPage />
            </div>
          ) : isEmpty || (nfts && nfts.length === 0) ? (
            <div className="w-full flex-1 h-[60vh] flex flex-col gap-4 justify-center items-center py-12">
              <p className="text-xl md:text-2xl text-gray-600 items-center">
                No items found for this search
              </p>
              <button
                onClick={() => {
                  setIsBuying(true);
                  setIsOnAuction(true);
                  Router.push("/assets");
                }}
                className="font-semibold text-base mt-4 bg-blue-500 hover:bg-blue-400 text-white rounded-xl py-4 px-6"
              >
                Back to all items
              </button>
            </div>
          ) : (
            <div
              className={`grid gap-4 flex-1 py-12 ${
                isMoreGrid
                  ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                  : " grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              }`}
            >
              {nfts && nfts.length > 0 ? (
                nfts.map((nft, i) => (
                  <NFTItem nft={nft} key={nft?.toString() + i.toString()} />
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
    </>
  );
}
