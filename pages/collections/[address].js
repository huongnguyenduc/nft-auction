import React, { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/router";
import { axiosFetcher } from "../../utils/fetcher";
import LoadingPage from "../../components/Loading";
import useSWRInfinite from "swr/infinite";
import NFTItem from "../../components/NFTItem";
import Image from "next/image";

const PAGE_SIZE = 6;

const Collection = () => {
  const router = useRouter();
  const { address } = router.query;
  const [collection, setCollection] = useState();
  useEffect(() => {
    async function getCollection() {
      const collectionResponse = await axiosFetcher(`collection/${address}`);
      console.log("aaa", collectionResponse);
      setCollection(collectionResponse.data);
    }
    getCollection();
  }, []);
  const { data, error, size, setSize } = useSWRInfinite(
    (index) => [
      `collection/${address}/nfts?pageNumber=${
        index + 1
      }&pageSize=${PAGE_SIZE}`,
    ],
    axiosFetcher
  );
  console.log(data, "data");
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
  if (isLoadingInitialData) return <LoadingPage />;
  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-full h-[43vh] ${"bg-gray-100 hover:bg-gray-300 relative"}`}
      >
        {collection?.banner ? (
          <Image
            layout="fill"
            objectFit="cover"
            src={collection.banner}
            alt="collection-banner"
          />
        ) : (
          <></>
        )}
        <div className="w-[180px] h-[180px] rounded-lg absolute bottom-[-30px] left-8 bg-white shadow flex justify-center items-center">
          <div className="w-[168px] h-[168px] rounded-lg bg-gray-400 relative overflow-hidden">
            {collection?.image ? (
              <Image
                layout="fill"
                objectFit="cover"
                src={collection?.image}
                alt="collection-avatar"
              />
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>
      <div
        className="px-8 pt-12 flex flex-col w-full"
        style={{ maxWidth: "1600px" }}
      >
        <p className="text-3xl font-semibold mb-2">{collection?.name}</p>
        <p className="text-base">{collection?.description}</p>
        <div className="flex justify-center w-full mt-4">
          <div className="flex w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-8 w-full">
              {nfts && nfts.length > 0 ? (
                nfts.map((nft, i) => <NFTItem key={nft.image + i} nft={nft} />)
              ) : (
                <></>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Collection;
