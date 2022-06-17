import React from "react";
import Router from "next/router";
import { useCallback, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import { axiosFetcher } from "../../utils/fetcher";
import LoadingPage from "../../components/Loading";
import useSWRInfinite from "swr/infinite";
import CollectionItem from "../../components/CollectionItem";
import CollectionItemSkeleton from "../../components/CollectionItemSkeleton";

const PAGE_SIZE = 6;

const Collections = () => {
  const { account: userAccount, isActive } = useWeb3React();
  useEffect(() => {
    if (!isActive) {
      Router.push(`/login?referrer=collections`);
    } else {
      // login();
    }
  }, [isActive]);
  const { data, error, size, setSize } = useSWRInfinite(
    userAccount
      ? (index) => [
          `user/${userAccount}/collections?pageNumber=${
            index + 1
          }&pageSize=${PAGE_SIZE}`,
        ]
      : null,
    axiosFetcher
  );

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
            {collections && collections.length > 0 ? (
              collections.map((collection) => (
                <CollectionItem
                  key={collection?.address}
                  collection={collection}
                  account={userAccount}
                  canEdit
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
  );
};

export default Collections;
