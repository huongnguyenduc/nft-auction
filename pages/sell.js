import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import axios from "axios";
import Web3Modal from "web3modal";
import Image from "next/image";

const marketplaceAddress = process.env.CONTRACT_ADDRESS;

import NFTMarketplace from "../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";

export default function ResellNFT() {
  const [formInput, updateFormInput] = useState({ price: "", image: "" });
  const [isCreateAuction, setIsCreateAuction] = useState(false);
  const router = useRouter();
  const { id, tokenURI } = router.query;
  const { image, price, name, description } = formInput;

  useEffect(() => {
    fetchNFT();
  }, [id]);

  async function fetchNFT() {
    if (!tokenURI) return;
    const meta = await axios.get(tokenURI);
    updateFormInput((state) => ({
      ...state,
      image: meta.data.image,
      name: meta.data.name,
      description: meta.data.description,
    }));
  }

  async function listNFTForSale() {
    if (!price) return;
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const priceFormatted = ethers.utils.parseUnits(formInput.price, "ether");
    let contract = new ethers.Contract(
      marketplaceAddress,
      NFTMarketplace.abi,
      signer
    );
    let listingPrice = await contract.getListingPrice();

    listingPrice = listingPrice.toString();
    let transaction = await contract.resellToken(id, priceFormatted, {
      value: listingPrice,
    });
    await transaction.wait();

    router.push("/");
  }

  return (
    <div className="flex justify-center">
      <div className="w-4/5 flex flex-col py-12">
        <p className="text-3xl font-bold mb-6">List item for sale</p>
        <div className="flex gap-10">
          <div className="flex-1">
            <p className="text-md font-medium">Type</p>
            <div className="flex gap-2">
              <div
                className={`flex flex-col items-center rounded-l-sm flex-1 px-5 py-12 border ${
                  isCreateAuction ? "cursor-pointer" : "bg-blue-50"
                }`}
                onClick={() => setIsCreateAuction(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-md font-medium text-center">Fixed Price</p>
              </div>
              <div
                onClick={() => setIsCreateAuction(false)}
                className="flex flex-col items-center rounded-r-sm flex-1 px-5 py-12 border"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-md font-medium">Timed Auction</p>
              </div>
            </div>
            <div className="flex">
              <input
                placeholder="Asset Price"
                className="mt-2 border rounded p-4 mr-4"
                onChange={(e) =>
                  updateFormInput({ ...formInput, price: e.target.value })
                }
              />
              <Image
                src="https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg"
                alt="eth-icon"
                height={20}
                width={20}
              />
            </div>
            <button
              onClick={listNFTForSale}
              className="font-bold mt-4 bg-blue-500 text-white rounded p-4 shadow-lg w-48"
            >
              Complete listing
            </button>
          </div>
          <div className="flex-1">
            <p className="text-xl font-medium">Preview</p>
            <div className="border shadow rounded-xl overflow-hidden transition ease-out hover:shadow-lg hover:-translate-y-0.5 w-fit">
              <img src={image} />
              <div className="p-4">
                <div className="flex justify-between">
                  <p className="text-md font-semibold">{name}</p>
                  <div className="flex">
                    <p className="text-md font-bold pr-1">{price}</p>
                    <Image
                      src="https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg"
                      alt="eth-icon"
                      height={20}
                      width={10}
                    />
                  </div>
                </div>
                <div style={{ height: "50px", overflow: "hidden" }}>
                  <p className="text-gray-400 text-md">{description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
