import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import Web3Modal from "web3modal";
import Image from "next/image";
import DateRange from "../components/DateRange";
import ERC721 from "../contracts/UITToken721.json";
import ERC1155 from "../contracts/UITToken1155.json";
import NFTMarketplace from "../contracts/NFTMarketplace.json";
import Router from "next/router";
import { isNumeric } from "../utils/utils";
import { Modal } from "rsuite";
import styles from "../components/Modal/Modal.module.css";
import { useWeb3React } from "@web3-react/core";
import { axiosFetcher } from "../utils/fetcher";
import ApiClient, { verifyUser } from "../utils/ApiClient";
import { useToaster } from "rsuite";
import NotificationUI from "../components/Notification";

const marketplaceAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

import { addDays } from "date-fns";
import Checked from "../components/Icon/Checked";

export default function ListNFT() {
  const router = useRouter();
  const toaster = useToaster();
  const { id } = router.query;
  const { isActive, account } = useWeb3React();
  useEffect(() => {
    async function verifyCurrentUser() {
      await verifyUser(account);
    }
    if (!isActive && id) {
      Router.push(`/login?referrer=sell&id=${id}&needSign=true`);
    } else if (account) {
      verifyCurrentUser();
    }
  }, [isActive, account]);
  const [isCreateAuction, setIsCreateAuction] = useState(false);
  const [openSellModal, setOpenSellModal] = useState(false);
  const handleOpenModal = () => setOpenSellModal(true);
  const handleCloseModal = () => setOpenSellModal(false);
  const [validateError, setValidateError] = useState("");
  const [date, setDate] = useState([new Date(), addDays(new Date(), 6)]);
  const [formInput, updateFormInput] = useState({ price: "", image: "" });
  const { image, price, name, description, isMultiToken } = formInput;
  const [listItemStatus, setListItemStatus] = useState("Input");
  const [listItemError, setListItemError] = useState();

  useEffect(() => {
    fetchNFT();
  }, [id]);

  async function fetchNFT() {
    const detailResponse = await axiosFetcher(`nft/id/${id}`);
    updateFormInput({
      ...detailResponse.data,
      price: 0,
    });
  }

  async function listNFTForSale() {
    if (!price) return;
    handleOpenModal();
    try {
      await verifyUser(account);
      setListItemError();
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      let nftContract = new ethers.Contract(
        formInput.collectionAddress,
        formInput.isMultiToken === true ? ERC1155.abi : ERC721.abi,
        signer
      );
      setListItemStatus("Approving");
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
      setListItemStatus("Listing");
      if (isCreateAuction) {
        const [startTime, endTime] = date;
        let transaction = await contract.listAuctionItem(
          id,
          Math.floor(startTime.getTime() / 1000),
          Math.floor(endTime.getTime() / 1000),
          priceFormatted,
          {
            value: listingPrice,
          }
        );
        await transaction.wait();
        const createAuctionRequest = await ApiClient(account).patch(
          `/nft/create-auction`,
          {
            tokenId: id,
            startTime: startTime.getTime(),
            endTime: endTime.getTime(),
            startingPrice: priceFormatted.toString(),
          }
        );
        console.log("created auction", createAuctionRequest);
        const successCode = toaster.push(
          <NotificationUI
            message="Create auction successfully."
            type="success"
          />,
          { placement: "bottomStart" }
        );
        setTimeout(() => toaster.remove(successCode), 2500);
      } else {
        let transaction = await contract.listMarketItem(id, priceFormatted, {
          value: listingPrice,
        });
        await transaction.wait();
        const createMarketItemRequest = await ApiClient(account).patch(
          `/nft/list-nft`,
          {
            tokenId: id,
            price: priceFormatted.toString(),
          }
        );
        console.log("created market item", createMarketItemRequest);
        const successCode = toaster.push(
          <NotificationUI message="List item successfully." type="success" />,
          { placement: "bottomStart" }
        );
        setTimeout(() => toaster.remove(successCode), 2500);
      }
      setListItemStatus("Listed");
    } catch (error) {
      setListItemError(error.message);
      console.log("Unknown error: ", error);
      const failureCode = toaster.push(
        <NotificationUI message={error.message} type="error" />,
        { placement: "bottomStart" }
      );
      setTimeout(() => toaster.remove(failureCode), 2500);
    }
  }

  return (
    <>
      <Modal
        open={openSellModal}
        onClose={() => {
          handleCloseModal();
          if (listItemStatus === "Listed") {
            Router.push(`/detail?id=${id}`);
          }
        }}
        className={styles.customModal}
      >
        <Modal.Header>
          <Modal.Title className="flex justify-center">
            <div className="text-center font-semibold text-xl">
              {listItemStatus === "Listed"
                ? "Your item is now listed for sale"
                : "Complete your listing"}
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {listItemStatus === "Listed" ? (
            <div className="flex flex-col items-center w-full">
              {image && <img className="rounded" width="180" src={image} />}
              <button
                onClick={() => {
                  Router.push(`/detail?id=${id}`);
                }}
                className="w-full py-3 mt-8 bg-blue-600 hover:bg-blue-700 transition ease-in rounded-xl text-white font-semibold text-base"
              >
                View Item
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <div className="flex gap-2 items-center">
                  {image && <img className="rounded" width="48" src={image} />}
                  <div>
                    <p className="text-gray-500 text-xs">
                      {isMultiToken === false ? "UITToken721" : "UITToken1155"}
                    </p>
                    <p className="font-semibold text-sm mt-[0px]">{name}</p>
                    <p className="text-gray-500 text-xs mt-[0px]">
                      Quantity: 1
                    </p>
                  </div>
                </div>
                <div className="flex items-end flex-col">
                  <p className="text-gray-500 text-xs">Price</p>
                  <div className="flex gap-1">
                    <Image
                      src="https://openseauserdata.com/files/6f8e2979d428180222796ff4a33ab929.svg"
                      alt="eth-icon"
                      height={14}
                      width={14}
                    />
                    <p className="font-semibold">{price}</p>
                  </div>
                </div>
              </div>
              <div className="flex rounded-t-lg p-[16px] border justify-between mt-8">
                <div className="flex gap-1 items-center">
                  <Checked />
                  <p className="font-semibold text-xl">
                    Initialize your wallet
                  </p>
                </div>
              </div>
              <div className="flex p-[16px] border justify-between">
                <div className="flex gap-1 items-center">
                  <div className="relative">
                    {listItemStatus !== "Listed" &&
                    listItemStatus !== "Listing" ? (
                      <>
                        <svg
                          role="status"
                          className="w-9 h-9 text-gray-200 animate-spin ml-1 mr-2"
                          viewBox="0 0 100 101"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                            fill="currentColor"
                          />
                          {listItemStatus === "Approving" ? (
                            <path
                              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                              fill="rgb(52, 199, 123)"
                            />
                          ) : (
                            <></>
                          )}
                        </svg>
                        <p className="absolute top-[6px] left-[18px] font-semibold text-base">
                          2
                        </p>
                      </>
                    ) : listItemError ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 text-red-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <Checked />
                    )}
                  </div>
                  <p className="font-semibold text-xl">
                    Approve this item for sale
                  </p>
                </div>
              </div>
              <div className="flex rounded-b-lg p-[16px] border justify-between">
                <div className="flex gap-1 items-center">
                  <div className="relative">
                    {listItemStatus !== "Listed" ? (
                      <>
                        <svg
                          role="status"
                          className="w-9 h-9 text-gray-200 animate-spin ml-1 mr-2"
                          viewBox="0 0 100 101"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                            fill="currentColor"
                          />
                          {listItemStatus === "Listing" ? (
                            <path
                              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                              fill="rgb(52, 199, 123)"
                            />
                          ) : (
                            <></>
                          )}
                        </svg>
                        <p className="absolute top-[6px] left-[18px] font-semibold text-base">
                          3
                        </p>
                      </>
                    ) : listItemError && listItemStatus === "Listing" ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 text-red-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <Checked />
                    )}
                  </div>
                  <p className="font-semibold text-xl">
                    Confirm {price} ETH listing
                  </p>
                </div>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="flex justify-center"></Modal.Footer>
      </Modal>
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
                      : "bg-[#fbfdff]"
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
                      ? "bg-[#fbfdff]"
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
                    <p className="text-sm font-medium">
                      Sell to highest bidder
                    </p>
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
                        updateFormInput({
                          ...formInput,
                          price: e.target.value,
                        });
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
                  <DateRange
                    value={date}
                    onChange={(value) => setDate(value)}
                  />
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
                        updateFormInput({
                          ...formInput,
                          price: e.target.value,
                        });
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
              <div className="border relative shadow rounded-xl overflow-hidden transition ease-out hover:shadow-lg hover:-translate-y-0.5 w-fit">
                <Image
                  src={image}
                  alt="nft-preview-image"
                  width={350}
                  height={350}
                  objectFit="cover"
                />
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
    </>
  );
}
