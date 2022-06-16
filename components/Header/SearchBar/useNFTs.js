import React from "react";
import { axiosFetcher } from "../../../utils/fetcher";

const useNFTs = () => {
  const [nfts, setNfts] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const getNfts = async (keyword) => {
    setLoading(true);
    const findNftsResponse = await axiosFetcher(
      `nft?name=${keyword}&bidded=false&sold=false`
    );
    setLoading(false);
    if (findNftsResponse?.data && findNftsResponse?.data.length > 0)
      setNfts(
        findNftsResponse.data.map((nft) => ({
          label: nft.name,
          value: `${nft.tokenId}||${nft.name}`,
        }))
      );
    else setNfts([]);
  };
  return [nfts, loading, getNfts];
};

export default useNFTs;
