import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Image from "next/image";
import { ethers } from "ethers";
import NFTMarketplace from "../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";
import Web3Modal from "web3modal";
import useAccount from "../components/useAccount";

const marketplaceAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

function convertWeiToEther(wei) {
  if (wei.toString() === "") {
    return "";
  }
  return ethers.utils.formatEther(wei.toString());
}

function getShortAddress(address, userAddress) {
  if (!address || address.length === 0) return;
  if (address.toLowerCase() === userAddress.toLowerCase()) return "you";
  return (
    address.substring(0, 6) + "..." + address.substring(address.length - 4)
  );
}

const dateOptions = {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  timeZone: "GMT",
  timeZoneName: "shortOffset",
};

function NFTDetail() {
  const router = useRouter();
  const userAccount = useAccount();
  console.log("user", userAccount);
  const { id, tokenURI, isMultiToken } = router.query;
  const [formInput, updateFormInput] = useState({ price: "", image: "" });
  const [nftData, setNftData] = useState({
    nftContract: "",
    seller: "",
    owner: "",
    price: "",
    sold: "",
    bidded: "",
    isMultiToken: "",
    auctionInfo: {
      startAt: "",
      endAt: "",
      highestBid: "",
      highestBidder: "",
      highestBidTime: "",
      bids: [],
      startingPrice: "",
    },
  });
  const { image, name, description } = formInput;

  useEffect(() => {
    fetchNFT();
  }, [id]);

  async function fetchNFT() {
    if (!tokenURI) return;
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    let contract = new ethers.Contract(
      marketplaceAddress,
      NFTMarketplace.abi,
      signer
    );
    const data = await contract.fetchMarketItem(id);
    setNftData(data);
    console.log(data);
    const meta = await axios.get(tokenURI);
    updateFormInput((state) => ({
      ...state,
      image: meta.data.image,
      name: meta.data.name,
      description: meta.data.description,
    }));
  }

  async function cancelListing() {
    try {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      let contract = new ethers.Contract(
        marketplaceAddress,
        NFTMarketplace.abi,
        signer
      );
      let transaction = await contract.cancelListingItem(id);
      await transaction.wait();
    } catch (error) {
      console.log("Unknown error: ", error);
    }
  }

  async function buyNft() {
    try {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      let contract = new ethers.Contract(
        marketplaceAddress,
        NFTMarketplace.abi,
        signer
      );
      let transaction = await contract.createMarketSale(id, {
        value: nftData.price,
      });
      await transaction.wait();
    } catch (error) {
      console.log("Unknown error: ", error);
    }
  }

  async function cancelBid() {
    try {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      let contract = new ethers.Contract(
        marketplaceAddress,
        NFTMarketplace.abi,
        signer
      );
      let transaction = await contract.withdrawBid(id);
      await transaction.wait();
    } catch (error) {
      console.log("Unknown error: ", error);
    }
  }

  return (
    <>
      {userAccount.toLowerCase() === nftData.owner.toLowerCase() ||
      nftData.seller.toLowerCase() === userAccount.toLowerCase() ? (
        <div className="fixed bg-blue-50 top-23 w-full z-50">
          <div className="flex justify-center">
            <div className="w-5/6 flex py-2 justify-end">
              {nftData.sold &&
              nftData.bidded &&
              nftData.owner.toLowerCase() === userAccount.toLowerCase() ? (
                <button
                  type="button"
                  className="text-white transition ease-in bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-semibold rounded-lg text-sm px-16 py-4 mr-2"
                  onClick={() => {
                    router.push(
                      `/sell?id=${id}&tokenURI=${tokenURI}&isMultiToken=${isMultiToken}`
                    );
                  }}
                >
                  Sell
                </button>
              ) : (
                <></>
              )}
              {!nftData.sold || !nftData.bidded ? (
                <button
                  type="button"
                  className="text-blue-600 border hover:shadow-md hover:border-blue-800 border-blue-500 bg-white hover:text-blue-800 focus:ring-4 focus:ring-blue-300 font-semibold rounded-lg text-sm px-10 py-4 transition ease-in"
                  onClick={cancelListing}
                >
                  Cancel listing
                </button>
              ) : (
                <></>
              )}
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
      <div className="flex justify-center w-full">
        <div className="w-5/6 flex flex-col pt-28">
          <div className="md:flex gap-6">
            <div className="basis-2/5 mb-8">
              <div className="flex flex-col items-center border shadow rounded-xl overflow-hidden w-full mb-4">
                <div className="p-4 w-full">
                  <div className="flex">
                    <Image
                      src="https://openseauserdata.com/files/6f8e2979d428180222796ff4a33ab929.svg"
                      alt="eth-icon"
                      height={20}
                      width={10}
                    />
                  </div>
                </div>
                <img src={image} />
              </div>
              <div className="flex flex-col border shadow rounded-xl overflow-hidden w-full">
                <div className="p-4 w-full flex">
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
                      d="M4 6h16M4 12h16M4 18h7"
                    />
                  </svg>
                  <p className="text-md font-medium ml-3">Description</p>
                </div>
                <div className="p-4 border-t bg-blue-50">
                  <p className="text-sm font-normal">{description}</p>
                </div>
                <div className="p-4 w-full flex justify-between">
                  <div className="flex">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-md font-medium ml-3">Detail</p>
                  </div>
                </div>
                <div className="p-4 border-t bg-blue-50">
                  <div className="flex justify-between mb-3">
                    <p className="text-sm font-normal">Contract Address</p>
                    <p className="text-sm font-medium text-blue-500 cursor-pointer">
                      <a
                        target="_blank"
                        href={`https://rinkeby.etherscan.io/address/${nftData.nftContract}`}
                        rel="noopener noreferrer"
                      >
                        {getShortAddress(nftData.nftContract, userAccount)}
                      </a>
                    </p>
                  </div>
                  <div className="flex justify-between mb-3">
                    <p className="text-sm font-normal">Token ID</p>
                    <p className="text-sm font-medium text-blue-500">{id}</p>
                  </div>
                  <div className="flex justify-between mb-3">
                    <p className="text-sm font-normal">Token Standard</p>
                    <p className="text-sm font-medium text-gray-500">
                      {isMultiToken == "true" ? "ERC-1155" : "ERC-721"}
                    </p>
                  </div>
                  <div className="flex justify-between mb-3">
                    <p className="text-sm font-normal">Blockchain</p>
                    <p className="text-sm font-medium text-gray-500">Rinkeby</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="basis-3/5">
              <p className="text-3xl font-semibold mb-8">{name}</p>
              <div className="flex gap-1 mb-8">
                <p className="text-sm font-normal text-gray-500 ">Own by </p>
                <p className="text-sm font-normal text-blue-500 cursor-pointer mt-0">
                  <a
                    target="_blank"
                    href={`https://rinkeby.etherscan.io/address/${
                      nftData.bidded && nftData.sold
                        ? nftData.owner
                        : nftData.seller
                    }`}
                    rel="noopener noreferrer"
                  >
                    {nftData.bidded && nftData.sold
                      ? getShortAddress(nftData.owner, userAccount)
                      : getShortAddress(nftData.seller, userAccount)}
                  </a>
                </p>
              </div>
              <div className="rounded-md border mb-4">
                {nftData.bidded ? (
                  <></>
                ) : (
                  <div className="flex p-4 border-b gap-2 align-middle text-gray-500 text-base">
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
                    <p>
                      Sale ends{" "}
                      {nftData.auctionInfo.endAt
                        ? new Date(
                            parseInt(
                              nftData.auctionInfo.endAt.toString() + "000"
                            )
                          ).toLocaleDateString("en-US", dateOptions)
                        : ""}
                    </p>
                  </div>
                )}
                {nftData.bidded && nftData.sold ? (
                  <></>
                ) : (
                  <div className="bg-blue-50 flex flex-col gap-3 p-4">
                    <p className=" text-gray-500">
                      {!nftData.bidded ? "Minimum bid" : "Current price"}
                    </p>
                    <div className="flex gap-3">
                      <Image
                        src="https://openseauserdata.com/files/6f8e2979d428180222796ff4a33ab929.svg"
                        alt="eth-icon"
                        height={15}
                        width={15}
                      />
                      <p className="font-semibold text-3xl">
                        {!nftData.bidded
                          ? parseInt(
                              nftData.auctionInfo.highestBid.toString()
                            ) > 0
                            ? convertWeiToEther(
                                nftData.auctionInfo.highestBid.toString()
                              )
                            : convertWeiToEther(
                                nftData.auctionInfo.startingPrice.toString()
                              )
                          : !nftData.sold
                          ? convertWeiToEther(nftData.price.toString())
                          : ""}
                      </p>
                    </div>
                    <button
                      title={
                        userAccount.toLowerCase() === nftData.seller
                          ? "You own this item"
                          : ""
                      }
                      type="button"
                      className={`${
                        userAccount.toLowerCase() ===
                        nftData.seller.toLowerCase()
                          ? "bg-blue-200 cursor-not-allowed"
                          : "bg-blue-700 hover:bg-blue-800"
                      } text-white flex justify-center items-center gap-2 w-3/5  focus:ring-4 focus:ring-blue-300 font-bold rounded-lg text-sm px-16 py-4 mr-2`}
                      onClick={
                        !nftData.bidded
                          ? () => {}
                          : () => {
                              buyNft();
                            }
                      }
                      disabled={
                        userAccount.toLowerCase() ===
                        nftData.seller.toLowerCase()
                      }
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
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                      {!nftData.bidded ? "Place bid" : "Buy now"}
                    </button>
                  </div>
                )}
              </div>
              {nftData.bidded ? (
                <></>
              ) : (
                <div className="rounded-md border">
                  <div className="p-4 flex gap-3">
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
                        d="M4 6h16M4 10h16M4 14h16M4 18h16"
                      />
                    </svg>
                    <p className="font-semibold">Offers</p>
                  </div>
                  <table className="table-auto w-full border-t">
                    <thead>
                      <tr>
                        <th className="text-left font-normal p-4">Price</th>
                        <th className="text-left font-normal p-4">From</th>
                        <th className="text-left font-normal p-4"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-blue-50">
                      {nftData?.auctionInfo?.bids.map((bidItem) => (
                        <tr key={bidItem.toString()} className="py-2">
                          <td className="flex gap-2 font-semibold p-4">
                            <Image
                              src="https://openseauserdata.com/files/6f8e2979d428180222796ff4a33ab929.svg"
                              alt="eth-icon"
                              height={10}
                              width={10}
                            />
                            {convertWeiToEther(bidItem?.bid.toString())}
                          </td>
                          <td className="p-4">
                            {getShortAddress(bidItem?.bidder, userAccount)}
                          </td>
                          <td>
                            {bidItem?.bidder.toLowerCase() ===
                            userAccount.toLowerCase() ? (
                              <button
                                onClick={cancelBid}
                                className="py-2 px-4 border text-sm border-blue-500 bg-white text-blue-600 rounded-md"
                              >
                                Cancel
                              </button>
                            ) : (
                              <></>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default NFTDetail;
