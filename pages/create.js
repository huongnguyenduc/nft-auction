import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { create as ipfsHttpClient } from "ipfs-http-client";
import Web3Modal from "web3modal";
import NFTMarketplace from "../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";
import Router from "next/router";
import { useWeb3React } from "@web3-react/core";
import LoadingUI from "../components/LoadingUI";
import { Modal } from "rsuite";
import styles from "../components/Modal/Modal.module.css";
import Checked from "../components/Icon/Checked";

const marketplaceAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const erc1155Address = process.env.NEXT_PUBLIC_ERC1155_CONTRACT_ADDRESS;
const erc721Address = process.env.NEXT_PUBLIC_ERC721_CONTRACT_ADDRESS;

const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

function redirectPage(result, tokenUri, collection) {
  const tokenId = result.toString();
  Router.push(
    `/detail?id=${tokenId}&tokenURI=${tokenUri}&isMultiToken=${
      collection === "erc1155"
    }`
  );
}

export default function CreateItem() {
  const { isActive } = useWeb3React();
  useEffect(() => {
    if (!isActive) {
      Router.push(`/login?referrer=create`);
    }
  }, [isActive]);

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
    collection: "erc721",
  });
  const [isMinting, setIsMinting] = useState(false);

  async function onChange(e) {
    const file = e.target.files[0];
    try {
      const added = await client.add(file, {
        progress: (prog) => console.log(`received: ${prog}`),
      });
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      setFileUrl(url);
      setValidateImageError("");
    } catch (error) {
      console.log("Error uploading file: ", error);
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
      const added = await client.add(data);
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      return url;
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }

  async function createMarketItem() {
    setIsMinting(true);
    handleOpenModal();
    const tokenUri = await uploadToIPFS();
    const { collection } = formInput;
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
      provider.once("block", () => {
        contract.on("MarketItemCreated", (result) =>
          redirectPage(result, tokenUri, collection)
        );
      });
      let transaction = await contract.createMarketItem(
        collection === "erc1155" ? erc1155Address : erc721Address,
        tokenUri,
        collection === "erc1155" ? true : false
      );
      await transaction.wait();
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
              {fileUrl && <img className="rounded" width="48" src={fileUrl} />}
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
          <p className="text-3xl font-bold mb-6">Create new item</p>
          <div className="w-full flex-none text-sm font-small text-slate-700 mt-2">
            <span className="text-red-600">*</span> Required field
          </div>
          <input
            type="file"
            name="Asset"
            className="block w-full text-sm mt-6 text-slate-500
      file:mr-4 file:py-2 file:px-4
      file:rounded-full file:border-0
      file:text-sm file:font-semibold
      file:bg-blue-50 file:text-blue-700
      hover:file:bg-blue-100 file:cursor-pointer cursor-pointer"
            onChange={onChange}
          />
          {fileUrl && (
            <img className="rounded mt-4" width="350" src={fileUrl} />
          )}
          <p className="text-red-500 mt-2">{validateImageError}</p>
          <div className="mt-6">
            <label
              htmlFor="name"
              className="block mb-2 text-md font-medium text-gray-900"
            >
              Name <span className="text-red-600">*</span>
            </label>
            <input
              id="name"
              placeholder="Item Name"
              className="border rounded p-4 w-full"
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
              className="block mb-2 text-md font-medium text-gray-900"
            >
              Description
            </label>
            <textarea
              id="description"
              placeholder="Provide a detailed description of your item."
              className="mt-2 border rounded p-4 w-full"
              onChange={(e) =>
                updateFormInput({ ...formInput, description: e.target.value })
              }
            />
          </div>
          <div className="mt-6">
            <label
              htmlFor="collection"
              className="block mb-2 text-md font-medium text-gray-900"
            >
              Collection
            </label>
            <select
              id="collection"
              onChange={(e) =>
                updateFormInput({ ...formInput, collection: e.target.value })
              }
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            >
              <option defaultValue value="erc721">
                UIT Token 721
              </option>
              <option value="erc1155">UIT Token 1155</option>
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
