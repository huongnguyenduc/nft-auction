import { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import Router from "next/router";
import { useWeb3React } from "@web3-react/core";
import LoadingUI from "../components/LoadingUI";
import { Modal } from "rsuite";
import styles from "../components/Modal/Modal.module.css";
import Checked from "../components/Icon/Checked";
import NFTMarketplace from "../contracts/NFTMarketplace.json";
import Image from "next/image";
import { uploadFileToIPFS } from "../utils/upload";
import ApiClient from "../utils/ApiClient";

const marketplaceAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

export default function CreateItem() {
  const { isActive, account, isActivating } = useWeb3React();
  const [userCollection, setUserCollection] = useState([]);
  const nftFileInput = useRef();
  useEffect(() => {
    if (!isActive) {
      Router.push(`/login?referrer=create`);
    } else {
      // login();
    }
  }, [isActive]);

  useEffect(() => {
    async function getUserCollection() {
      const userCollectionResponse = await ApiClient(account).get(
        `/user/collections`
      );
      console.log("collection list", userCollectionResponse);
      setUserCollection(userCollectionResponse?.data?.data);
      if (
        userCollectionResponse?.data?.data &&
        userCollectionResponse?.data?.data.length > 0
      )
        updateFormInput({
          ...formInput,
          collection: userCollectionResponse?.data?.data[0],
        });
    }
    if (!!isActive && !!account && !isActivating) {
      getUserCollection();
    }
  }, [account]);

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const handleOpenModal = () => setOpenCreateModal(true);
  const handleCloseModal = () => setOpenCreateModal(false);
  const [validateError, setValidateError] = useState("");
  const [validateImageError, setValidateImageError] = useState("");
  const [createTokenError, setCreateTokenError] = useState("");
  const [fileUrl, setFileUrl] = useState(null);

  const [formInput, updateFormInput] = useState({
    name: "",
    description: "",
    collection: {},
  });
  const [isMinting, setIsMinting] = useState(false);

  async function onChange(e) {
    const file = e.target.files[0];
    try {
      const url = await uploadFileToIPFS(file);
      setFileUrl(url);
      setValidateImageError("");
    } catch (error) {
      setValidateImageError(error);
    }
  }
  async function uploadToIPFS() {
    const { name, description } = formInput;
    if (!name || !fileUrl) return;
    const data = JSON.stringify({
      name,
      description,
      image: fileUrl,
    });
    try {
      const url = await uploadFileToIPFS(data);
      return url;
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }

  async function createMarketItem() {
    setIsMinting(true);
    handleOpenModal();
    const tokenUri = await uploadToIPFS();
    const { collection, name, description } = formInput;
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    try {
      let contract = new ethers.Contract(
        marketplaceAddress,
        NFTMarketplace.abi,
        signer
      );
      let listingPrice = await contract.getListingPrice();
      listingPrice = listingPrice.toString();
      console.log("collection ne", collection);
      let transaction = await contract.createMarketItem(
        collection.address,
        tokenUri,
        collection.isMultiToken
      );
      const rc = await transaction.wait();
      const event = rc.events.find(
        (event) => event.event === "MarketItemCreated"
      );
      const tokenId = event.args[0].toString();
      const mintTokenRequest = await ApiClient(account).post(`/nft`, {
        tokenId,
        nftContract: collection.address,
        name,
        description,
        image: fileUrl,
        isMultiToken: collection.isMultiToken,
      });
      console.log(mintTokenRequest, "request");
      Router.push(`/detail?id=${mintTokenRequest?.data?.data?.tokenId}`);
      setIsMinting(false);
      handleCloseModal();
      setCreateTokenError("");
    } catch (error) {
      console.log("Unknown error: ", error);
      setCreateTokenError(error.message);
      setIsMinting(false);
      handleCloseModal();
    }
  }

  return (
    <>
      <Modal
        open={openCreateModal}
        onClose={handleCloseModal}
        className={styles.customModal}
      >
        <Modal.Header>
          <Modal.Title className="flex justify-center">
            <div className="text-center font-semibold text-xl">
              Complete your creating
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="flex justify-between items-center">
            <div className="flex gap-2 items-center">
              {fileUrl && (
                <div className="rounded overflow-hidden">
                  <Image
                    width={48}
                    height={48}
                    src={fileUrl}
                    alt="nft-image"
                    objectFit="contain"
                  />
                </div>
              )}
              <div>
                <p className="text-gray-500 text-xs">
                  {formInput.collection === "erc721"
                    ? "UITToken721"
                    : "UITToken1155"}
                </p>
                <p className="font-semibold text-sm mt-[0px]">
                  {formInput.name}
                </p>
                <p className="text-gray-500 text-xs mt-[0px]">Quantity: 1</p>
              </div>
            </div>
          </div>
          <div className="flex rounded-t-lg p-[16px] border justify-between mt-8">
            <div className="flex gap-1 items-center">
              <Checked />
              <p className="font-semibold text-xl">Initialize your wallet</p>
            </div>
          </div>
          <div className="flex rounded-b-lg p-[16px] border justify-between">
            <div className="flex gap-1 items-center">
              <div className="relative">
                {isMinting ? (
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
                      <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                        fill="rgb(52, 199, 123)"
                      />
                    </svg>
                    <p className="absolute top-[6px] left-[18px] font-semibold text-base">
                      2
                    </p>
                  </>
                ) : createTokenError ? (
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
              <p className="font-semibold text-xl">Confirm creating</p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="flex justify-center"></Modal.Footer>
      </Modal>
      <div className="flex justify-center">
        <div className="w-1/2 flex flex-col py-12">
          <p className="text-4xl font-semibold mb-6">Create New Item</p>
          <div className="w-full flex-none text-xs font-medium text-gray-500 mt-2">
            <span className="text-red-600">*</span> Required field
          </div>
          <input
            type="file"
            id="asset"
            name="asset"
            className="hidden"
            onChange={onChange}
            ref={nftFileInput}
          />
          <label
            htmlFor="asset"
            className="block mb-2 text-base font-semibold text-gray-900 mt-4"
          >
            Image <span className="text-red-600">*</span>
          </label>
          <div
            onClick={() => nftFileInput.current.click()}
            className="border-dashed border-[3px] border-gray-300 rounded-lg h-[257px] w-[350px] flex justify-center items-center cursor-pointer p-1"
          >
            <div className="relative flex justify-center items-center hover:bg-gray-200/50 w-full h-full rounded-lg z-11">
              {fileUrl ? (
                <div className="absolute rounded-lg overflow-hidden w-full h-full z-10">
                  <Image
                    layout="fill"
                    src={fileUrl}
                    unoptimized={true}
                    objectFit="cover"
                    alt="avatar-image"
                  />
                </div>
              ) : (
                <></>
              )}
              <svg
                className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiSvgIcon-root MuiSvgIcon-fontSizeLarge css-1shn170"
                focusable="false"
                height="84"
                width="84"
                aria-hidden="true"
                viewBox="0 0 24 24"
                data-testid="ImageIcon"
                tabIndex="-1"
                title="Image"
                fill="rgb(156 163 175)"
              >
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"></path>
              </svg>
            </div>
          </div>
          <p className="text-red-500 mt-2">{validateImageError}</p>
          <div className="mt-6">
            <label
              htmlFor="name"
              className="block mb-2 text-base font-semibold text-gray-900"
            >
              Name <span className="text-red-600">*</span>
            </label>
            <input
              id="name"
              placeholder="Item Name"
              className="border rounded p-4 w-full focus:shadow-lg focus-visible:outline-none"
              onChange={(e) => {
                updateFormInput({ ...formInput, name: e.target.value });
                if (!e.target.value) {
                  setValidateError("Name is required");
                } else {
                  setValidateError("");
                }
              }}
            />
            <p className="text-red-500 mt-2">{validateError}</p>
          </div>
          <div className="mt-6">
            <label
              htmlFor="description"
              className="block mb-2 text-base font-semibold text-gray-900"
            >
              Description
            </label>
            <textarea
              id="description"
              placeholder="Provide a detailed description of your item."
              className="mt-2 border rounded p-4 w-full focus:shadow-lg border-gray-300 focus:border-gray-300 focus:ring-0"
              onChange={(e) =>
                updateFormInput({ ...formInput, description: e.target.value })
              }
            />
          </div>
          <div className="mt-6">
            <label
              htmlFor="collection"
              className="block mb-2 text-base font-semibold text-gray-900"
            >
              Collection
            </label>
            <select
              id="collection"
              onChange={(e) =>
                updateFormInput({ ...formInput, collection: e.target.value })
              }
              className="border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:shadow-lg focus:border-gray-400 focus:ring-0"
            >
              {userCollection && userCollection.length > 0 ? (
                userCollection.map((collection) => (
                  <option key={collection.address} value={collection}>
                    {collection.name}
                  </option>
                ))
              ) : (
                <></>
              )}
            </select>
          </div>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => {
                setCreateTokenError("");
                if (!fileUrl) setValidateImageError("Image is required");
                else if (!formInput.name) setValidateError("Name is required");
                else createMarketItem();
              }}
              className="font-bold mt-4 bg-blue-500 text-white rounded p-4 w-32"
              disabled={isMinting || validateError || validateImageError}
            >
              {isMinting ? <LoadingUI /> : <></>}
              Create
            </button>
            <p className="text-red-500">{createTokenError}</p>
          </div>
        </div>
      </div>
    </>
  );
}
