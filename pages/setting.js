import React from "react";
import Head from "next/head";

const Setting = () => {
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
              />
              <p htmlFor="bio" className="font-semibold text-base mb-2">
                Bio
              </p>
              <input
                id="bio"
                placeholder="Tell the world your story!"
                className="border-2 rounded-lg p-3 w-full text-base mb-4"
              />
              <p htmlFor="email" className="font-semibold text-base mb-2">
                Email Address
              </p>
              <input
                id="email"
                placeholder="Tell the world your story!"
                className="border-2 rounded-lg p-3 w-full text-base mb-4"
              />
              <p htmlFor="wallet" className="font-semibold text-base mb-2">
                Wallet Address
              </p>
              <input
                id="wallet"
                placeholder="0x70cfca35d339eb5c1cb6d8cd905ae019f324128a"
                className="border-2 rounded-lg p-3 w-full text-base mb-4"
                disabled
              />
              <button className="font-semibold bg-blue-500 text-white text-base rounded-xl px-6 py-4">
                Save
              </button>
            </div>
            <div className="flex-1">
              <p htmlFor="avatar" className="font-semibold text-base mb-2">
                Profile Image
              </p>
              <div className="w-[150px] h-[150px] rounded-[150px] mb-4">
                <img
                  src="https://lh3.googleusercontent.com/_70_WkLyBXX9bpKfA1vzWAJM0samNsL13jwIKSl0Lh-jC2LdipKLKJi8fCZfGgDb8ljAyCm2dzYsj1ifg180hGxa-n0F9zHwFj8-EyI=s150"
                  alt="user-avatar"
                  className="rounded-[150px]"
                />
              </div>
              <p htmlFor="banner" className="font-semibold text-base mb-2">
                Profile Banner
              </p>
              <div className="max-w-[420px] min-h-[130px] h-[130px] rounded-xl mb-4 overflow-hidden">
                <img
                  src="https://lh3.googleusercontent.com/_70_WkLyBXX9bpKfA1vzWAJM0samNsL13jwIKSl0Lh-jC2LdipKLKJi8fCZfGgDb8ljAyCm2dzYsj1ifg180hGxa-n0F9zHwFj8-EyI=s150"
                  alt="user-banner"
                  className="rounded-xl object-contain h-full"
                />
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
