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
      <div className="w-1/2 flex flex-col py-12">
        <p className="text-3xl font-bold mb-6">List item for sale</p>
        <div className="flex">
          <div className="mr-36">
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
          <div>
            <p className="text-xl font-medium">Preview</p>
            <div className="border shadow rounded-xl overflow-hidden transition ease-out hover:shadow-lg hover:-translate-y-0.5">
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
