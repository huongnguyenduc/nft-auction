import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
import Web3Modal from "web3modal";
import { useRouter } from "next/router";
import Image from "next/image";
import { getShortAddress } from "../utils/utils";
import { useWeb3React } from "@web3-react/core";
import Router from "next/router";

const marketplaceAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const erc1155Address = process.env.NEXT_PUBLIC_ERC1155_CONTRACT_ADDRESS;
const erc721Address = process.env.NEXT_PUBLIC_ERC721_CONTRACT_ADDRESS;

import NFTMarketplace from "../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";
import NFTItem from "../components/NFTItem";

export default function MyAssets() {
  const { isActive, account: userAccount } = useWeb3React();
  useEffect(() => {
    if (!isActive) {
      Router.push(`/login?referrer=account`);
    } else {
      loadNFTs();
    }
  }, [isActive]);
  const [nfts, setNfts] = useState([]);
  const [tabState, setTabState] = useState("collected");
  const [loadingState, setLoadingState] = useState("not-loaded");
  const router = useRouter();
  useEffect(() => {
    loadNFTs();
  }, [userAccount]);
  async function loadNFTs() {
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
    const data = await contract.fetchMyNFTs();

    const items = await Promise.all(
      data.map(async (i) => {
        const tokenUri = i.isMultiToken
          ? await contract.get1155TokenURI(i.tokenId, erc1155Address)
          : await contract.get721TokenURI(i.tokenId, erc721Address);
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
          tokenUri: tokenUri,
          isMultiToken: i.isMultiToken,
        };
        return item;
      })
    );
    setNfts(items);
    setLoadingState("loaded");
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
          tokenUri: tokenUri,
          isMultiToken: i.isMultiToken,
        };
        return item;
      })
    );

    setListedNfts(items);
    setLoading("loaded");
  }

  const [biddingNfts, setBiddingNfts] = useState([]);

  async function loadBiddingNFTs() {
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
    const data = await contract.fetchAvailableBiddedAuction();

    const items = await Promise.all(
      data.map(async (i) => {
        const tokenUri = i.isMultiToken
          ? await contract.get1155TokenURI(i.tokenId, erc1155Address)
          : await contract.get721TokenURI(i.tokenId, erc721Address);
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
          tokenUri: tokenUri,
          isMultiToken: i.isMultiToken,
        };
        return item;
      })
    );

    setBiddingNfts(items);
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
            onClick={() => {
              setTabState("collected");
              loadNFTs();
            }}
            className={`flex gap-2 ${
              tabState === "collected" ? "border-b-2" : ""
            } border-black items-center pb-2 cursor-pointer`}
          >
            <p className="font-semibold text-lg">Collected</p>
            <p className="text-lg font-normal mt-0">
              {nfts.length > 0 ? nfts.length : ""}
            </p>
          </div>
          <div
            onClick={() => {
              setTabState("onSale");
              loadListedNFTs();
            }}
            className={`flex gap-2 ${
              tabState === "onSale" ? "border-b-2" : ""
            } border-black items-center pb-2 text-gray-500 cursor-pointer`}
          >
            <p className="font-semibold text-lg">On sale</p>
            <p className="text-lg font-normal mt-0">
              {listedNfts.length > 0 ? listedNfts.length : ""}
            </p>
          </div>
          <div
            onClick={() => {
              setTabState("bidding");
              loadBiddingNFTs();
            }}
            className={`flex ${
              tabState === "bidding" ? "border-b-2" : ""
            } gap-2 border-black items-center pb-2 text-gray-500 cursor-pointer`}
          >
            <p className="font-semibold text-lg">Bidding</p>
            <p className="text-lg font-normal mt-0">
              {biddingNfts.length > 0 ? biddingNfts.length : ""}
            </p>
          </div>
        </div>
        <div className="flex justify-center">
          <div className="flex max-w-[1440px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
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
