import Image from "next/image";
import React from "react";
import ERC721Contract from "../../contracts/UITToken721.json";
import ERC1155Contract from "../../contracts/UITToken1155.json";
import Web3Modal from "web3modal";
import Router from "next/router";
import { useWeb3React } from "@web3-react/core";
import { uploadFileToCloudinary } from "../../utils/upload";
import ApiClient from "../../utils/ApiClient";
import { ethers } from "ethers";
import { useState } from "react";
import LoadingUI from "../../components/LoadingUI";
import NotificationUI from "../../components/Notification";
import { useToaster } from "rsuite";

const marketplaceAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

const CreateCollection = () => {
  const { isActive, account } = useWeb3React();

  React.useEffect(() => {
    if (!isActive) {
      Router.push(`/login?referrer=collections/create`);
    } else {
      // login();
    }
  }, [isActive]);
  const avatarFileInput = React.useRef();
  const bannerFileInput = React.useRef();
  const [collectionForm, setCollectionForm] = React.useState({
    logoImage: "",
    logoImageURL: "",
    bannerImage: "",
    bannerImageURL: "",
    name: "",
    description: "",
    type: "erc721",
  });
  const [collectionFormError, setCollectionFormError] = React.useState({
    logoImageError: "",
    nameError: "",
  });

  const toaster = useToaster();

  function selectedAvatarFile(event) {
    if (event.target.files[0]) {
      setCollectionForm((prevData) => ({
        ...prevData,
        logoImage: event.target.files[0],
        logoImageURL: URL.createObjectURL(event.target.files[0]),
      }));
    }
  }
  function selectedBannerFile(event) {
    if (event.target.files[0]) {
      setCollectionForm((prevData) => ({
        ...prevData,
        bannerImage: event.target.files[0],
        bannerImageURL: URL.createObjectURL(event.target.files[0]),
      }));
    }
  }

  function validateCreateCollection() {
    let isValidated = true;
    if (!collectionForm.logoImage) {
      setCollectionFormError((error) => ({
        ...error,
        logoImageError: "Logo image is required.",
      }));
      isValidated = false;
    }
    if (!collectionForm.name) {
      setCollectionFormError((error) => ({
        ...error,
        nameError: "Name is required.",
      }));
      isValidated = false;
    }
    return isValidated;
  }

  const [createStatus, setCreateStatus] = useState("adding");
  const [createError, setCreateError] = useState("");

  async function createCollection() {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = await provider.getSigner();
    let contract;
    setCreateStatus("creating");
    try {
      const { url: image } = await uploadFileToCloudinary(
        collectionForm.logoImage
      );
      const { url: banner } = await uploadFileToCloudinary(
        collectionForm.bannerImage
      );
      if (collectionForm.type === "erc1155") {
        contract = new ethers.ContractFactory(
          ERC1155Contract.abi,
          ERC1155Contract.bytecode,
          signer
        );
      } else {
        contract = new ethers.ContractFactory(
          ERC721Contract.abi,
          ERC721Contract.bytecode,
          signer
        );
      }
      const collection = await contract.deploy(
        collectionForm.name,
        "UIT",
        marketplaceAddress
      );
      await collection.deployed();
      console.log("collection", collection.address);
      const createCollectionResponse = await ApiClient(account).post(
        "/collection",
        {
          name: collectionForm.name,
          address: collection.address,
          isMultiToken: collectionForm.type === "erc721" ? false : true,
          image,
          banner,
          description: collectionForm.description,
        }
      );
      setCreateStatus("created");
      const successCode = toaster.push(
        <NotificationUI
          message="Create collection successfully."
          type="success"
        />,
        { placement: "bottomStart" }
      );
      setTimeout(() => toaster.remove(successCode), 2500);
      console.log("create collection", createCollectionResponse);
      Router.push(`/collections/${collection.address}`);
    } catch (error) {
      setCreateStatus("adding");
      setCreateError(error.message);
      const failureCode = toaster.push(
        <NotificationUI message={error.message} type="error" />,
        { placement: "bottomStart" }
      );
      setTimeout(() => toaster.remove(failureCode), 2500);
      console.log("Unknown error: ", error);
    }
  }
  return (
    <div className="flex justify-center">
      <div className="w-2/3 flex flex-col py-12">
        <p className="text-4xl font-semibold mb-6">Create a Collection</p>
        <div className="w-full flex-none text-xs font-medium text-slate-600 mt-2">
          <span className="text-red-600">*</span> Required field
        </div>
        <div className="mt-6">
          <label
            htmlFor="avatarInput"
            className="block mb-2 text-base font-semibold text-gray-900"
          >
            Logo image <span className="text-red-600">*</span>
          </label>
          <p className="w-full flex-none text-xs font-medium text-slate-600 mt-2 mb-4">
            This image will also be used for navigation. 350 x 350 recommended.
          </p>
          <input
            id="avatarInput"
            style={{ display: "none" }}
            type="file"
            ref={avatarFileInput}
            accept="image/*"
            onChange={selectedAvatarFile}
          />

          <div
            onClick={() => avatarFileInput.current.click()}
            className="border-dashed border-[3px] border-gray-400 rounded-[50%] h-[160px] w-[160px] flex justify-center items-center cursor-pointer p-1"
          >
            <div className="relative flex justify-center items-center hover:bg-gray-200/50 w-full h-full rounded-[50%] z-11">
              {collectionForm.logoImageURL ? (
                <div className="absolute rounded-[50%] overflow-hidden w-full h-full z-10">
                  <Image
                    layout="fill"
                    src={collectionForm.logoImageURL}
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
          <p className="text-red-500 mt-2">
            {collectionFormError.logoImageError}
          </p>
        </div>
        <div className="mt-6">
          <label
            htmlFor="bannerInput"
            className="block mb-2 text-base font-semibold text-gray-900"
          >
            Banner image
          </label>
          <input
            id="bannerInput"
            style={{ display: "none" }}
            type="file"
            ref={bannerFileInput}
            accept="image/*"
            onChange={selectedBannerFile}
          />
          <p className="w-full flex-none text-xs font-medium text-slate-600 mt-2 mb-4">
            This image will appear at the top of your collection page. Avoid
            including too much text in this banner image, as the dimensions
            change on different devices. 1400 x 400 recommended.
          </p>
          <div
            onClick={() => bannerFileInput.current.click()}
            className="border-dashed border-[3px] border-gray-400 rounded-lg h-[200px] w-[700px] flex justify-center items-center p-1 cursor-pointer"
          >
            <div className="relative flex justify-center items-center hover:bg-gray-200/50 w-full h-full rounded-lg z-5">
              {collectionForm.bannerImageURL ? (
                <div className="absolute rounded-lg overflow-hidden w-full h-full z-10 hover:z-[3]">
                  <Image
                    layout="fill"
                    src={collectionForm.bannerImageURL}
                    unoptimized={true}
                    objectFit="cover"
                    alt="banner-image"
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
        </div>
        <div className="mt-6">
          <label
            htmlFor="name"
            className="block mb-2 text-base font-semibold text-gray-900"
          >
            Name <span className="text-red-600">*</span>
          </label>
          <input
            id="name"
            placeholder="Enter name"
            onChange={(e) => {
              setCollectionForm((state) => ({
                ...state,
                name: e.target.value,
              }));
            }}
            className="border-2 rounded-lg p-3 w-full text-base mb-4 focus:shadow-lg focus-visible:outline-none"
          />
          <p className="text-red-500 mt-2">{collectionFormError.nameError}</p>
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
            onChange={(e) => {
              setCollectionForm((state) => ({
                ...state,
                description: e.target.value,
              }));
            }}
            className="mt-2 border-2 border-gray-200 focus:border-gray-200 focus:ring-gray-200 rounded-lg p-3 w-full focus:shadow-lg focus-visible:outline-none"
          />
        </div>
        <div className="mt-6">
          <label
            htmlFor="collection"
            className="block mb-2 text-base font-semibold text-gray-900"
          >
            Collection Type
          </label>
          <select
            id="collection"
            onChange={(e) =>
              setCollectionForm((prevData) => ({
                ...prevData,
                type: e.target.value,
              }))
            }
            className="border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:shadow-lg focus-visible:outline-none border-gray-200 focus:border-gray-200 focus:ring-gray-200"
          >
            <option defaultValue value="erc721">
              ERC721
            </option>
            <option value="erc1155">ERC1155</option>
          </select>
        </div>
        <div className="flex gap-4 items-center">
          <button
            onClick={() => {
              if (validateCreateCollection()) createCollection();
            }}
            disabled={createStatus === "creating"}
            className="font-bold mt-6 bg-blue-500 text-white rounded-xl py-4 px-6"
          >
            {createStatus === "creating" ? <LoadingUI /> : <></>}
            Create
          </button>
          <p className="text-red-500">{createError}</p>
        </div>
      </div>
    </div>
  );
};

export default CreateCollection;
