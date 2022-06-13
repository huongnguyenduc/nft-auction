import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
// import Web3Modal from "web3modal";
import NFTItem from "../components/NFTItem";

const marketplaceAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const erc1155Address = process.env.NEXT_PUBLIC_ERC1155_CONTRACT_ADDRESS;
const erc721Address = process.env.NEXT_PUBLIC_ERC721_CONTRACT_ADDRESS;

import NFTMarketplace from "../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";
import LoadingPage from "../components/Loading";
// import { axiosFetcher } from "../utils/fetcher";

export default function Home() {
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");
  useEffect(() => {
    loadNFTs();
  }, []);
  async function loadNFTs() {
    // const web3Modal = new Web3Modal();
    // const connection = await web3Modal.connect();
    // const provider = new ethers.providers.Web3Provider(connection);
    const network = "rinkeby"; // use rinkeby testnet
    const provider = ethers.getDefaultProvider(network);
    const contract = new ethers.Contract(
      marketplaceAddress,
      NFTMarketplace.abi,
      provider
    );
    const data = await contract.fetchAvailableMarketItems();

    const items = await Promise.all(
      data.map(async (i) => {
        const tokenUri = i.isMultiToken
          ? await contract.get1155TokenURI(i.tokenId.toString(), erc1155Address)
          : await contract.get721TokenURI(i.tokenId.toString(), erc721Address);
        const meta = await axios.get(tokenUri);
        let price = ethers.utils.formatUnits(i.price.toString(), "ether");
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description,
          tokenUri: tokenUri,
          isMultiToken: i.isMultiToken,
          auctionInfo: i.auctionInfo,
          sold: i.sold,
          bidded: i.bidded,
        };
        return item;
      })
    );
    setNfts(items);
    setLoadingState("loaded");
  }
  if (loadingState === "not-loaded") return <LoadingPage />;
  if (loadingState === "loaded" && !nfts.length)
    return <h1 className="px-20 py-10 text-3xl">No items in marketplace</h1>;
  return (
    <div className="flex justify-center">
      <div className="px-4 py-12" style={{ maxWidth: "1600px" }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {nfts.map((nft, i) => (
            <NFTItem nft={nft} key={nft.toString() + i.toString()} />
          ))}
        </div>
      </div>
    </div>
  );
}
