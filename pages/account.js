import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
import Web3Modal from "web3modal";
import { useRouter } from "next/router";
import Image from "next/image";
import { getShortAddress, timeLeft } from "../utils/utils";
import useAccount from "../components/useAccount";

const marketplaceAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

import NFTMarketplace from "../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";

export default function MyAssets() {
  const [nfts, setNfts] = useState([]);
  const { account: userAccount } = useAccount();
  const [loadingState, setLoadingState] = useState("not-loaded");
  const router = useRouter();
  useEffect(() => {
    loadNFTs();
    loadListedNFTs();
  }, []);
  async function loadNFTs() {
    const web3Modal = new Web3Modal({
      network: "mainnet",
      cacheProvider: true,
    });
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const marketplaceContract = new ethers.Contract(
      marketplaceAddress,
      NFTMarketplace.abi,
      signer
    );
    const data = await marketplaceContract.fetchMyNFTs();

    const items = await Promise.all(
      data.map(async (i) => {
        const tokenURI = await marketplaceContract.tokenURI(i.tokenId);
        const meta = await axios.get(tokenURI);
        let price = ethers.utils.formatUnits(i.price.toString(), "ether");
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
          name: meta.data.name,
          tokenURI,
        };
        return item;
      })
    );
    setNfts(items);
    setLoadingState("loaded");
  }
  function listNFT(nft) {
    console.log("nft:", nft);
    router.push(`/sell?id=${nft.tokenId}&tokenURI=${nft.tokenURI}`);
  }

  const [listedNfts, setListedNfts] = useState([]);
  const [loading, setLoading] = useState("not-loaded");

  async function loadListedNFTs() {
    const web3Modal = new Web3Modal({
      network: "mainnet",
      cacheProvider: true,
    });
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const contract = new ethers.Contract(
      marketplaceAddress,
      NFTMarketplace.abi,
      signer
    );
    const data = await contract.fetchItemsListed();

    const items = await Promise.all(
      data.map(async (i) => {
        const tokenUri = i.isMultiToken
          ? await contract.get1155TokenURI(i.tokenId)
          : await contract.get721TokenURI(i.tokenId);
        const meta = await axios.get(tokenUri);
        let price = ethers.utils.formatUnits(i.price.toString(), "ether");
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          sold: i.sold,
          bidded: i.bidded,
          auctionInfo: i.auctionInfo,
          image: meta.data.image,
          name: meta.data.name,
        };
        return item;
      })
    );

    setListedNfts(items);
    setLoading("loaded");
  }
  // if (
  //   loading === "loaded" &&
  //   !listedNfts.length &&
  //   loadingState === "loaded" &&
  //   !nfts.length
  // )
  //   return <h1 className="py-10 px-20 text-3xl">No NFTs owned</h1>;
  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-full h-[43vh] ${"bg-gray-100 hover:bg-gray-300 relative"}`}
      >
        <div className="w-[180px] h-[180px] rounded-[180px] absolute bottom-[-30px] left-8 bg-white shadow flex justify-center items-center">
          <div className="w-[168px] h-[168px] rounded-[168px] bg-gray-400"></div>
        </div>
      </div>
      <div
        className="px-8 pt-12 flex flex-col w-full"
        style={{ maxWidth: "1600px" }}
      >
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
            className={`flex gap-2 border-b-2 border-black items-center pb-2`}
          >
            <p className="font-semibold text-lg">Collected</p>
            <p className="text-lg font-normal">11</p>
          </div>
          <div
            className={`flex gap-2 border-black items-center pb-2 text-gray-500`}
          >
            <p className="font-semibold text-lg">Created</p>
            <p className="text-lg font-normal">11</p>
          </div>
          <div
            className={`flex gap-2 border-black items-center pb-2 text-gray-500`}
          >
            <p className="font-semibold text-lg">Bidded</p>
            <p className="text-lg font-normal">11</p>
          </div>
          <div
            className={`flex gap-2 border-black items-center pb-2 text-gray-500`}
          >
            <p className="font-semibold text-lg">On sale</p>
            <p className="text-lg font-normal">11</p>
          </div>
        </div>
        <div className="flex">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            {nfts.map((nft, i) => (
              <div
                key={i}
                className="border shadow rounded-xl overflow-hidden bg-blue-100 transition ease-out hover:shadow-lg hover:-translate-y-0.5"
              >
                <img src={nft.image} className="rounded" />
                <div className="p-4">
                  <div className="flex justify-between align-middle">
                    <p className="text-sm font-semibold">{nft.name}</p>
                    <button
                      className="w-16 bg-blue-500 text-white font-bold py-1 px-3 rounded"
                      onClick={() => listNFT(nft)}
                    >
                      List
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {listedNfts.map((nft, i) => (
              <div
                key={i}
                className="border shadow rounded-xl overflow-hidden bg-white transition ease-out hover:shadow-lg hover:-translate-y-0.5"
              >
                <img src={nft.image} className="rounded" />
                <div className="p-3">
                  <div className="flex justify-between">
                    <p className="text-xs font-semibold">{nft.name}</p>
                    <div className="flex flex-col items-end gap-1">
                      <p className="text-xs font-thin">Min Bid</p>
                      <div className="flex justify-end">
                        <p className="text-xs font-semibold pr-1">
                          {nft.price}
                        </p>
                        <Image
                          src="https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg"
                          alt="eth-icon"
                          height={8}
                          width={8}
                        />
                      </div>
                      <div className="flex justify-end items-center gap-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <p className="text-xs font-thin">
                          {nft?.auctionInfo?.endAt
                            ? timeLeft(
                                new Date(
                                  Date.now() +
                                    parseInt(nft?.auctionInfo?.endAt.toString())
                                )
                              )
                            : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
