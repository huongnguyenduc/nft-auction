import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
import Web3Modal from "web3modal";
import Router from "next/router";

const marketplaceAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

import NFTMarketplace from "../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";
import Image from "next/image";

export default function Home() {
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");
  useEffect(() => {
    loadNFTs();
  }, []);
  async function loadNFTs() {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const contract = new ethers.Contract(
      marketplaceAddress,
      NFTMarketplace.abi,
      provider
    );
    const data = await contract.fetchAllNFTs(0, 20);

    console.log("data", data[0]);
    const items = await Promise.all(
      data[0].map(async (i) => {
        const tokenUri = i.isMultiToken
          ? await contract.get1155TokenURI(i.tokenId.toString())
          : await contract.get721TokenURI(i.tokenId.toString());
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
          tokenURI: tokenUri,
          isMultiToken: i.isMultiToken,
        };
        return item;
      })
    );
    setNfts(items);
    setLoadingState("loaded");
  }
  async function buyNft(nft) {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      marketplaceAddress,
      NFTMarketplace.abi,
      signer
    );

    const price = ethers.utils.parseUnits(nft.price.toString(), "ether");
    const transaction = await contract.createMarketSale(nft.tokenId, {
      value: price,
    });
    await transaction.wait();
    loadNFTs();
  }
  if (loadingState === "loaded" && !nfts.length)
    return <h1 className="px-20 py-10 text-3xl">No items in marketplace</h1>;
  return (
    <div className="flex justify-center">
      <div className="px-4 py-12" style={{ maxWidth: "1600px" }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {nfts.map((nft, i) => (
            <div
              key={i}
              className="border cursor-pointer shadow rounded-xl overflow-hidden transition ease-out hover:shadow-lg hover:-translate-y-0.5"
              onClick={() =>
                Router.push(
                  `/detail?id=${nft.tokenId}&tokenURI=${nft.tokenURI}&isMultiToken=${nft.isMultiToken}`
                )
              }
            >
              <img src={nft.image} />
              <div className="p-4">
                <div className="flex justify-between">
                  <p className="text-xl font-semibold">{nft.name}</p>
                  <div className="flex">
                    <p className="text-md font-bold pr-1">{nft.price}</p>
                    <Image
                      src="https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg"
                      alt="eth-icon"
                      height={20}
                      width={10}
                    />
                  </div>
                </div>
                <div style={{ height: "50px", overflow: "hidden" }}>
                  <p className="text-gray-400">{nft.description}</p>
                </div>
              </div>
              <div className="p-4 bg-blue-100">
                <button
                  className="w-full bg-blue-500 text-white font-bold py-2 px-12 rounded"
                  onClick={() => buyNft(nft)}
                >
                  Buy
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
