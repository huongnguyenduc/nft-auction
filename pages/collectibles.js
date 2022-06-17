import { useCallback, useEffect } from "react";
import Image from "next/image";
import { axiosFetcher } from "../utils/fetcher";
import LoadingPage from "../components/Loading";
import useSWRInfinite from "swr/infinite";
import CollectionItem from "../components/CollectionItem";
import { useWeb3React } from "@web3-react/core";
import CollectionItemSkeleton from "../components/CollectionItemSkeleton";

const PAGE_SIZE = 6;

const Collectibles = () => {
  const { account } = useWeb3React();
  const { data, error, size, setSize } = useSWRInfinite(
    (index) => [`collection?pageNumber=${index + 1}&pageSize=${PAGE_SIZE}`],
    axiosFetcher
  );
  console.log(data, "data");
  const collections = data
    ? [].concat(...data?.map((response) => response?.data))
    : [];
  const isLoadingInitialData = !data && !error;
  const isLoadingMore =
    isLoadingInitialData ||
    (size > 0 && data && typeof data[size - 1] === "undefined");
  const isEmpty = data?.[0].data?.length === 0;
  const hasNoMore =
    isEmpty || (data && data?.[0]?.pagination?.total === collections?.length);
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
      <div className="w-full h-[220px] relative">
        <Image
          layout="fill"
          objectFit="cover"
          src="https://lh3.googleusercontent.com/l8oHCZk1C7EsY4Up-84SzLRwBGrRCDh7Z5k8WDnWIU1749AFyGY-ULYvZ952vKUhOydLrbdZHwjr50ARrqE2kYPEMqwHhg72d1JthQ=s2500"
          alt="collectibles-banner"
        />
      </div>
      <div className="text-center w-full mt-6 text-[40px] font-semibold">
        Explore Collectibles
      </div>
      <div className="flex justify-center w-full">
        <div className="py-12 max-w-[1600px] w-full">
          {isLoadingInitialData ? (
            <div className="w-full flex-1 flex justify-center items-center overflow-hidden py-12">
              <LoadingPage />
            </div>
          ) : isEmpty || (collections && collections.length === 0) ? (
            <div className="w-full flex-1 h-[60vh] flex flex-col gap-4 justify-center items-center py-12">
              <p className="text-xl md:text-2xl text-gray-600 items-center">
                No items to display
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-4 px-8">
              {collections && collections.length > 0 ? (
                collections.map((collection) => (
                  <CollectionItem
                    key={collection.address}
                    collection={collection}
                    account={account}
                  />
                ))
              ) : (
                <></>
              )}
              {hasNoMore ? (
                <></>
              ) : isLoadingMore ? (
                <>
                  <CollectionItemSkeleton />
                  <CollectionItemSkeleton />
                  <CollectionItemSkeleton />
                  <CollectionItemSkeleton />
                  <CollectionItemSkeleton />
                  <CollectionItemSkeleton />
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
};

export default Collectibles;
