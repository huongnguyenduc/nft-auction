import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import axios from "axios";
import Web3Modal from "web3modal";
import Image from "next/image";
import DateRange from "../components/DateRange";
import ERC721 from "../artifacts/contracts/UITToken721.sol/UITToken721.json";
import ERC1155 from "../artifacts/contracts/UITToken1155.sol/UITToken1155.json";
import NFTMarketplace from "../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";
import Router from "next/router";

const marketplaceAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const erc1155Address = process.env.NEXT_PUBLIC_ERC1155_CONTRACT_ADDRESS;
const erc721Address = process.env.NEXT_PUBLIC_ERC1155_CONTRACT_ADDRESS;
import { addDays } from "date-fns";

function isNumeric(str) {
  if (typeof str != "string") return false; // we only process strings!
  return (
    !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
    !isNaN(parseFloat(str))
  ); // ...and ensure strings of whitespace fail
}

export default function ResellNFT() {
  const [isCreateAuction, setIsCreateAuction] = useState(false);
  const [validateError, setValidateError] = useState("");
  const [date, setDate] = useState([new Date(), addDays(new Date(), 6)]);
  const router = useRouter();
  const { id, tokenURI, isMultiToken } = router.query;
  const [formInput, updateFormInput] = useState({ price: "", image: "" });
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
    try {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      let nftContract = new ethers.Contract(
        isMultiToken === "true" ? erc1155Address : erc721Address,
        isMultiToken === "true" ? ERC1155.abi : ERC721.abi,
        signer
      );
      let approval = await nftContract.setParentApproval();
      await approval.wait();
      const priceFormatted = ethers.utils.parseUnits(formInput.price, "ether");
      let contract = new ethers.Contract(
        marketplaceAddress,
        NFTMarketplace.abi,
        signer
      );
      let listingPrice = await contract.getListingPrice();
      listingPrice = listingPrice.toString();
      if (isCreateAuction) {
        const [startTime, endTime] = date;
        let transaction = await contract.listAuctionItem(
          id,
          startTime.getTime(),
          endTime.getTime(),
          priceFormatted,
          {
            value: listingPrice,
            // gasLimit: 1000000,
            // gasPrice: ethers.utils.parseUnits("1.0", "gwei"),
          }
        );
        await transaction.wait();
      } else {
        let transaction = await contract.listMarketItem(id, priceFormatted, {
          value: listingPrice,
          // gasLimit: 2000000,
          // gasPrice: ethers.utils.parseUnits("1.0", "gwei"),
        });
        await transaction.wait();
      }
      Router.push(
        `/detail?id=${id}&tokenURI=${tokenURI}&isMultiToken=${isMultiToken}`
      );
    } catch (error) {
      console.log("Unknown error: ", error);
    }
  }

  return (
    <div className="flex justify-center">
      <div className="w-4/5 flex flex-col py-12">
        <p className="text-3xl font-bold mb-6">List item for sale</p>
        <div className="flex gap-10">
          <div className="flex-1">
            <p className="text-md font-medium mb-3">Type</p>
            <div className="flex mb-8">
              <div
                className={`flex flex-col items-center rounded-l-sm flex-1 py-7 border transition ease-in ${
                  isCreateAuction
                    ? "cursor-pointer text-gray-400 hover:text-gray-900"
                    : "bg-blue-50"
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
                <p className="text-md font-medium text-center mt-2">
                  Fixed Price
                </p>
              </div>
              <div
                onClick={() => setIsCreateAuction(true)}
                className={`flex flex-col items-center rounded-l-sm flex-1 py-7 border transition ease-in ${
                  isCreateAuction
                    ? "bg-blue-50"
                    : "cursor-pointer text-gray-400 hover:text-gray-900"
                }`}
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
                <p className="text-md font-medium mt-2">Timed Auction</p>
              </div>
            </div>
            {isCreateAuction ? (
              <div>
                <p className="text-md font-medium mb-3">Method</p>
                <div className="p-3 border rounded-md flex gap-3 mb-8">
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
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                  <p className="text-sm font-medium">Sell to highest bidder</p>
                </div>
                <p className="text-md font-medium mb-3">Starting price</p>
                <div className="flex gap-3 mb-8">
                  <Image
                    src="https://openseauserdata.com/files/6f8e2979d428180222796ff4a33ab929.svg"
                    alt="eth-icon"
                    height={20}
                    width={20}
                  />
                  <input
                    placeholder="Amount"
                    className="border rounded p-4 w-full"
                    value={formInput.price}
                    onChange={(e) => {
                      updateFormInput({ ...formInput, price: e.target.value });
                      if (!isNumeric(e.target.value)) {
                        setValidateError("Invalid amount");
                      } else {
                        setValidateError("");
                      }
                    }}
                  />
                </div>
                <p className="text-md font-medium mb-3 text-red-600">
                  {validateError}
                </p>
                <p className="text-md font-medium mb-3">Duration</p>
                <DateRange value={date} onChange={(value) => setDate(value)} />
              </div>
            ) : (
              <div>
                <p className="text-md font-medium mb-3">Price</p>
                <div className="flex gap-3 mb-8">
                  <Image
                    src="https://openseauserdata.com/files/6f8e2979d428180222796ff4a33ab929.svg"
                    alt="eth-icon"
                    height={20}
                    width={20}
                  />
                  <input
                    placeholder="Amount"
                    className="border rounded p-4 w-full"
                    value={formInput.price}
                    onChange={(e) => {
                      updateFormInput({ ...formInput, price: e.target.value });
                      if (!isNumeric(e.target.value)) {
                        setValidateError("Invalid amount");
                      } else {
                        setValidateError("");
                      }
                    }}
                  />
                </div>
                <p className="text-md font-medium mb-3 text-red-600">
                  {validateError}
                </p>
              </div>
            )}
            <p className="text-md font-medium mb-3 mt-8">Fees</p>
            <div className="flex justify-between">
              <p className="text-sm font-medium mb-4 text-gray-500">
                Service Fee
              </p>
              <p className="text-sm font-medium mb-4 text-gray-500">
                0.025{" "}
                <Image
                  src="https://openseauserdata.com/files/6f8e2979d428180222796ff4a33ab929.svg"
                  alt="eth-icon"
                  height={10}
                  width={10}
                />
              </p>
            </div>
            <button
              onClick={listNFTForSale}
              className={`font-bold mt-4 ${
                !formInput.price || !!validateError
                  ? "bg-blue-300"
                  : "bg-blue-500"
              } text-white rounded p-4 shadow-lg w-48`}
              disabled={!formInput.price || !!validateError}
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
                      src="https://openseauserdata.com/files/6f8e2979d428180222796ff4a33ab929.svg"
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
