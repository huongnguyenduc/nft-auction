import React from "react";
import Router from "next/router";
import { useCallback, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import ApiClient, { apiClientFetcher } from "../../utils/ApiClient";
import LoadingPage from "../../components/Loading";
import useSWRInfinite from "swr/infinite";
import CollectionItem from "../../components/CollectionItem";

const PAGE_SIZE = 6;

const Collections = () => {
  const { isActive, account: userAccount } = useWeb3React();
  const { data, error, size, setSize } = useSWRInfinite(
    userAccount
      ? (index) => [
          `/user/collections?pageNumber=${index + 1}&pageSize=${PAGE_SIZE}`,
        ]
      : null,
    (endpoint) =>
      ApiClient(userAccount)
        .get(endpoint)
        .then((res) => res.data)
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
  if (isLoadingInitialData) return <LoadingPage />;
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
          {collections && collections.length > 0 ? (
            collections.map((collection) => (
              <CollectionItem
                key={collection.address}
                collection={collection}
              />
            ))
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
};

export default Collections;
