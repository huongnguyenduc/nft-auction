import React, { useState, useRef } from "react";
import Head from "next/head";
import Image from "next/image";
import { useWeb3React } from "@web3-react/core";
import { uploadFileToCloudinary } from "../utils/upload";
import LoadingUI from "../components/LoadingUI";
import { useToaster } from "rsuite";
import ApiClient, { verifyUser } from "../utils/ApiClient";
import NotificationUI from "../components/Notification";
import { useEffect } from "react";
import { axiosFetcher } from "../utils/fetcher";
import Router from "next/router";

const Setting = () => {
  const { account, isActive } = useWeb3React();
  const toaster = useToaster();
  const avatarFileInput = useRef();
  const bannerFileInput = useRef();
  const [userForm, setUserForm] = useState({
    username: "",
    bio: "",
    email: "",
    image: "",
    imageURL: "",
    banner: "",
    bannerURL: "",
    wallet: "",
  });
  useEffect(() => {
    async function verifyCurrentUser() {
      await verifyUser(account);
    }
    if (!isActive) {
      Router.push(`/login?referrer=setting&needSign=true`);
    } else if (account) {
      verifyCurrentUser();
    }
  }, [isActive, account]);
  useEffect(() => {
    async function getUser() {
      const userData = await axiosFetcher(`user/${account}`);
      if (userData?.data) {
        setUserForm(userData.data);
      }
    }
    if (account) {
      getUser();
    }
  }, [account]);
  const [userFormError, setUserFormError] = React.useState({
    emailError: "",
  });
  function selectedAvatarFile(event) {
    if (event.target.files[0]) {
      setUserForm((prevData) => ({
        ...prevData,
        image: event.target.files[0],
        imageURL: URL.createObjectURL(event.target.files[0]),
      }));
    }
  }
  function selectedBannerFile(event) {
    if (event.target.files[0]) {
      setUserForm((prevData) => ({
        ...prevData,
        banner: event.target.files[0],
        bannerURL: URL.createObjectURL(event.target.files[0]),
      }));
    }
  }
  function validateUserForm() {
    let isValidated = true;
    if (
      userForm.email &&
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        userForm.email
      ) === false
    ) {
      setUserFormError((prevState) => ({
        ...prevState,
        emailError: "Email form is invalid",
      }));
      isValidated = false;
    }
    return isValidated;
  }
  const [updateStatus, setUpdateStatus] = useState("update");
  async function updateUser() {
    await verifyUser(account);
    setUpdateStatus("update");
    try {
      setUpdateStatus("updating");
      let image = userForm.image;
      let banner = userForm.banner;
      if (userForm.imageURL) {
        const { url } = await uploadFileToCloudinary(userForm.image);
        image = url;
      }
      if (userForm.bannerURL) {
        const { url } = await uploadFileToCloudinary(userForm.banner);
        banner = url;
      }
      const updateUserResponse = await ApiClient(account).patch("/user", {
        username: userForm.username,
        image,
        banner,
        bio: userForm.bio,
        email: userForm.email,
      });
      setUpdateStatus("updated");
      const successCode = toaster.push(
        <NotificationUI message="Update user successfully." type="success" />,
        { placement: "bottomStart" }
      );
      setTimeout(() => toaster.remove(successCode), 2500);
      console.log("Update user", updateUserResponse);
    } catch (error) {
      setUpdateStatus("error");
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
      <Head>
        <title>Profile details | OpenSky</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <div className="w-full flex">
        <div className="h-[90vh] w-[262px] lg:w-[340px] border-r px-5">
          <p className="py-[8px] px-[10px] font-medium my-3">SETTINGS</p>
          <div className="flex gap-3 p-4 bg-blue-50/50 rounded-lg">
            <svg
              className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiSvgIcon-root MuiSvgIcon-fontSizeLarge css-1shn170"
              focusable="false"
              aria-hidden="true"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              data-testid="AccountBoxIcon"
              tabIndex="-1"
              title="AccountBox"
            >
              <path d="M3 5v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H5c-1.11 0-2 .9-2 2zm12 4c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3zm-9 8c0-2 4-3.1 6-3.1s6 1.1 6 3.1v1H6v-1z"></path>
            </svg>
            <p className="font-semibold">Profile</p>
          </div>
        </div>
        <div className="p-10 mt-6 w-full">
          <p className="text-4xl font-semibold">Profile details</p>
          <div className="flex gap-16 mt-8">
            <div className="flex-1">
              <p htmlFor="username" className="font-semibold text-base mb-2">
                Username
              </p>
              <input
                id="username"
                placeholder="Enter username"
                className="border-2 rounded-lg p-3 w-full text-base mb-4"
                value={userForm.username}
                onChange={(e) => {
                  setUserForm((state) => ({
                    ...state,
                    username: e.target.value,
                  }));
                }}
              />
              <p htmlFor="bio" className="font-semibold text-base mb-2">
                Bio
              </p>
              <input
                id="bio"
                placeholder="Tell the world your story!"
                className="border-2 rounded-lg p-3 w-full text-base mb-4"
                value={userForm.bio}
                onChange={(e) => {
                  setUserForm((state) => ({
                    ...state,
                    bio: e.target.value,
                  }));
                }}
              />
              <p htmlFor="email" className="font-semibold text-base mb-2">
                Email Address
              </p>
              <input
                id="email"
                placeholder="Tell the world your story!"
                className="border-2 rounded-lg p-3 w-full text-base"
                value={userForm.email}
                onChange={(e) => {
                  setUserForm((state) => ({
                    ...state,
                    email: e.target.value,
                  }));
                }}
              />
              <p className="text-red-500 mt-2 mb-4">
                {userFormError.emailError}
              </p>
              <p htmlFor="wallet" className="font-semibold text-base mb-2">
                Wallet Address
              </p>
              <input
                id="wallet"
                className="border-2 rounded-lg p-3 w-full text-base mb-4"
                disabled
                value={userForm.wallet}
              />

              <button
                onClick={() => {
                  if (validateUserForm()) {
                    updateUser();
                  }
                }}
                className="font-semibold bg-blue-500 text-white text-base rounded-xl px-6 py-4"
              >
                {updateStatus === "updating" ? <LoadingUI /> : <></>}
                Save
              </button>
            </div>
            <div className="flex-1">
              <p htmlFor="avatar" className="font-semibold text-base mb-2">
                Profile Image
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
                className="w-[150px] h-[150px] rounded-[150px] mb-4 relative overflow-hidden cursor-pointer"
              >
                {userForm.imageURL ? (
                  <div className="absolute rounded-[50%] overflow-hidden w-full h-full z-10">
                    <Image
                      layout="fill"
                      src={userForm.imageURL}
                      unoptimized={true}
                      objectFit="cover"
                      alt="user-avatar"
                    />
                  </div>
                ) : userForm.image ? (
                  <div className="absolute rounded-[50%] overflow-hidden w-full h-full z-10">
                    <Image
                      layout="fill"
                      src={userForm.image}
                      unoptimized={true}
                      objectFit="cover"
                      alt="user-avatar"
                    />
                  </div>
                ) : (
                  <></>
                )}
              </div>
              <p htmlFor="banner" className="font-semibold text-base mb-2">
                Profile Banner
              </p>
              <input
                id="bannerInput"
                style={{ display: "none" }}
                type="file"
                ref={bannerFileInput}
                accept="image/*"
                onChange={selectedBannerFile}
              />
              <div
                onClick={() => bannerFileInput.current.click()}
                className="max-w-[150px] min-h-[130px] h-[130px] rounded-xl mb-4 overflow-hidden relative cursor-pointer"
              >
                {userForm.bannerURL ? (
                  <div className="absolute rounded-[50%] overflow-hidden w-full h-full z-10">
                    <Image
                      layout="fill"
                      src={userForm.bannerURL}
                      unoptimized={true}
                      objectFit="cover"
                      alt="user-banner"
                    />
                  </div>
                ) : userForm.banner ? (
                  <div className="absolute rounded-[50%] overflow-hidden w-full h-full z-10">
                    <Image
                      layout="fill"
                      src={userForm.banner}
                      unoptimized={true}
                      objectFit="cover"
                      alt="user-banner"
                    />
                  </div>
                ) : (
                  <></>
                )}
              </div>
            </div>
            <div className="flex-1"></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Setting;
