import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
import Web3Modal from "web3modal";
import { useRouter } from "next/router";
import Image from "next/image";

const marketplaceAddress = process.env.CONTRACT_ADDRESS;

import NFTMarketplace from "../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";

export default function MyAssets() {
  const [nfts, setNfts] = useState([]);
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
        const tokenUri = await contract.tokenURI(i.tokenId);
        const meta = await axios.get(tokenUri);
        let price = ethers.utils.formatUnits(i.price.toString(), "ether");
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
          name: meta.data.name,
        };
        return item;
      })
    );

    setListedNfts(items);
    setLoading("loaded");
  }
  if (
    loading === "loaded" &&
    !listedNfts.length &&
    loadingState === "loaded" &&
    !nfts.length
  )
    return <h1 className="py-10 px-20 text-3xl">No NFTs owned</h1>;
  return (
    <div className="flex justify-center">
      <div className="px-4 py-12" style={{ maxWidth: "1600px" }}>
        <p className="text-3xl font-bold">My NFTs</p>
        <div className="flex justify-center">
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
              {nfts.map((nft, i) => (
                <div
                  key={i}
                  className="border shadow rounded-xl overflow-hidden bg-blue-100 transition ease-out hover:shadow-lg hover:-translate-y-0.5"
                >
                  <img src={nft.image} className="rounded" />
                  <div className="p-4">
                    <div className="flex justify-between align-middle">
                      <p className="text-md font-semibold">{nft.name}</p>
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
                  className="border shadow rounded-xl overflow-hidden bg-blue-100 transition ease-out hover:shadow-lg hover:-translate-y-0.5"
                >
                  <img src={nft.image} className="rounded" />
                  <div className="p-4">
                    <div className="flex justify-between">
                      <p className="text-md font-semibold">{nft.name}</p>
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
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
