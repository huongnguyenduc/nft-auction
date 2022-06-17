/* eslint-disable @next/next/link-passhref */
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Router, { useRouter } from "next/router";
import { Drawer } from "rsuite";
import styles from "./Header.module.css";
import {
  useDrawerState,
  useDrawerDispatch,
  openDrawer,
  closeDrawer,
} from "../useDrawer";
import { useWeb3React } from "@web3-react/core";
import WalletList from "../WalletList";
import { metaMask } from "../../connectors/metaMask";
import { coinbaseWallet } from "../../connectors/coinbaseWallet";
import { walletConnect } from "../../connectors/walletConnect";
import { URI_AVAILABLE } from "@web3-react/walletconnect";
import { CHAINS } from "../../chains";
import useHover from "../CustomHook/useHover";
import { getShortAddress } from "../../utils/utils";
import useBalance from "../useBalance";
import Image from "next/image";
import NumberFormat from "react-number-format";
import { Tooltip, Whisper } from "rsuite";
import { getName, getImage } from "../../utils/web3";
import SearchBar from "./SearchBar/SearchBar";
import { axiosFetcher } from "../../utils/fetcher";
import { signOut } from "next-auth/react";

function Header() {
  const { isActive, chainId, account, provider, connector } = useWeb3React();
  const [referrer, setReferrer] = useState("");
  const { isDrawerOpen } = useDrawerState();
  const drawerDispatch = useDrawerDispatch();
  function goToPage(_referrer) {
    if (isActive) {
      Router.push(`${_referrer}`);
    } else {
      setReferrer(_referrer);
      openDrawer(drawerDispatch);
    }
  }

  const balance = useBalance(provider, account);

  // attempt to connect eagerly on mount
  useEffect(() => {
    void coinbaseWallet.connectEagerly().catch(() => {
      console.debug("Failed to connect eagerly to coinbase wallet");
    });
    void metaMask.connectEagerly().catch(() => {
      console.debug("Failed to connect eagerly to metamask");
    });
    walletConnect.events.on(URI_AVAILABLE, (uri) => {
      console.log(`uri: ${uri}`);
    });
  }, []);
  const [userData, setUserData] = useState();
  useEffect(() => {
    async function getUser() {
      const userData = await axiosFetcher(`user/${account}`);
      if (userData?.data) {
        setUserData(userData.data);
      } else {
        setUserData({});
      }
    }
    if (account) {
      getUser();
    }
  }, [account]);

  const [hoverProfileRef, isHoveredProfile] = useHover();
  const [hoverProfileMenuRef, isHoveredProfileMenu] = useHover();

  const [hoverExploreRef, isHoveredExplore] = useHover();
  const [hoverExploreMenuRef, isHoveredExploreMenu] = useHover();
  const [etherToUSD, setEtherToUSD] = useState(0);
  useEffect(() => {
    async function getEther2USD() {
      const ether2USD = await fetch(
        "https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD"
      ).then((value) => value.json());
      console.log("ether", ether2USD);
      setEtherToUSD(ether2USD.USD);
    }
    getEther2USD();
  }, [isDrawerOpen]);
  const handleWalletDrawerOpen = () => {
    isDrawerOpen ? closeDrawer(drawerDispatch) : openDrawer(drawerDispatch);
  };
  const tooltip = (
    <Tooltip arrow={false} className={styles.tooltipCustom}>
      <div className="rounded-xl shadow-xl min-w-[220px] max-w-[350px] max-h-[350px]">
        <div className="flex justify-between p-4 border-b">
          <div className="flex gap-4">
            <Image
              src={getImage(connector)}
              alt="wallet-small-image"
              width={24}
              height={24}
            />
            <p className="text-sm font-semibold">{getName(connector)}</p>
          </div>
          <svg
            className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiSvgIcon-root MuiSvgIcon-fontSizeLarge css-1shn170"
            focusable="false"
            aria-hidden="true"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            data-testid="DoneIcon"
            tabIndex="-1"
            title="Done"
            fill="rgb(52, 199, 123)"
          >
            <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"></path>
          </svg>
        </div>
        <div
          onClick={() => {
            if (connector?.deactivate) {
              connector.deactivate();
            } else {
              connector.resetState();
            }
            signOut();
          }}
          className="flex justify-between p-4 cursor-pointer hover:bg-blue-50/60 hover:shadow-lg"
        >
          <div className="flex gap-4">
            <svg
              className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiSvgIcon-root MuiSvgIcon-fontSizeLarge css-1shn170"
              focusable="false"
              aria-hidden="true"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              data-testid="LogoutIcon"
              tabIndex="-1"
              title="Logout"
            >
              <path d="m17 7-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"></path>
            </svg>
            <p className="text-sm font-semibold">Log out</p>
          </div>
        </div>
      </div>
    </Tooltip>
  );

  return (
    <>
      <Drawer
        open={isDrawerOpen}
        onClose={() => closeDrawer(drawerDispatch)}
        size="xs"
      >
        <Drawer.Header className={styles.drawerTitle}>
          <Drawer.Title>
            {isActive ? (
              <div className="">
                <div className="flex justify-between items-center">
                  <Whisper
                    placement="bottomStart"
                    controlId="control-id-context-menu"
                    trigger="click"
                    speaker={tooltip}
                  >
                    <div className="flex gap-2 items-center cursor-pointer">
                      <div className="w-[30px] h-[30px] rounded-[50%] border-2 flex justify-center items-center">
                        <div className="w-[26px] h-[26px] rounded-[50%] relative overflow-hidden">
                          <Image
                            layout="fill"
                            objectFit="cover"
                            src="https://lh3.googleusercontent.com/_70_WkLyBXX9bpKfA1vzWAJM0samNsL13jwIKSl0Lh-jC2LdipKLKJi8fCZfGgDb8ljAyCm2dzYsj1ifg180hGxa-n0F9zHwFj8-EyI=s60"
                            alt="avatar-drawer"
                          />
                        </div>
                      </div>
                      <p className="text-base font-semibold">duchuong007</p>
                      <svg
                        className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiSvgIcon-root MuiSvgIcon-fontSizeLarge css-1shn170"
                        focusable="false"
                        aria-hidden="true"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        data-testid="KeyboardArrowDownIcon"
                        tabIndex="-1"
                        title="KeyboardArrowDown"
                        fill="rgb(112, 122, 131)"
                      >
                        <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"></path>
                      </svg>
                    </div>
                  </Whisper>
                  <p className="font-medium text-gray-500 text-sm">
                    {getShortAddress(account)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex gap-3 items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-[30px] w-[30px] text-gray-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="font-semibold">My wallet</p>
              </div>
            )}
          </Drawer.Title>
        </Drawer.Header>
        <Drawer.Body style={{ padding: "20px" }}>
          {isActive ? (
            <>
              <div className="border py-8 flex justify-center w-full rounded-xl">
                <div className="flex flex-col items-center">
                  <p className="text-sm text-gray-500 font-medium">
                    Total balance
                  </p>
                  <p className="text-xl font-semibold mt-0">
                    <NumberFormat
                      value={
                        balance * (etherToUSD === 0 ? 1230.85 : etherToUSD)
                      }
                      decimalScale={2}
                      displayType={"text"}
                      thousandSeparator={true}
                      prefix={"$"}
                      renderText={(value, props) => (
                        <div {...props}>{value}</div>
                      )}
                      suffix=" USD"
                    />
                  </p>
                </div>
              </div>
              <div className="p-4 mt-4 flex justify-between border rounded-xl">
                <div className="flex gap-4 items-center">
                  <Image
                    src="https://openseauserdata.com/files/6f8e2979d428180222796ff4a33ab929.svg"
                    alt="eth-icon"
                    height={24}
                    width={24}
                  />
                  <div>
                    <p className="font-semibold text-sm">ETH</p>
                    <p className="mt-0 text-xs font-medium text-gray-500">
                      {CHAINS[chainId].name}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <p className="font-semibold">
                    <NumberFormat
                      value={balance}
                      displayType={"text"}
                      thousandSeparator={true}
                      decimalScale={4}
                      renderText={(value, props) => (
                        <div {...props}>{value}</div>
                      )}
                    />
                  </p>
                  <p className="mt-0 text-xs font-medium text-gray-500">
                    <NumberFormat
                      value={
                        balance * (etherToUSD === 0 ? 1230.85 : etherToUSD)
                      }
                      displayType={"text"}
                      thousandSeparator={true}
                      decimalScale={2}
                      prefix={"$"}
                      renderText={(value, props) => (
                        <div {...props}>{value}</div>
                      )}
                      suffix=" USD"
                    />
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-500 text-base mb-8">
                Connect with one of our available wallet providers or create a
                new one.
              </p>
              <WalletList referrer={referrer} />
            </>
          )}
        </Drawer.Body>
      </Drawer>
      <div
        ref={hoverProfileMenuRef}
        className={`flex flex-col w-[245px] fixed right-1 top-[72px] shadow-md bg-white z-[1052] rounded-md transition ease-in-out${
          isHoveredProfile || isHoveredProfileMenu
            ? " h-auto"
            : " h-0 overflow-hidden"
        }`}
      >
        <div
          onClick={() => goToPage("/account")}
          className="flex gap-4 p-4 items-center border-b hover:bg-[#fbfdff] hover:shadow cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clipRule="evenodd"
            />
          </svg>
          <p className="font-medium text-base">Profile</p>
        </div>
        <div
          onClick={() => goToPage("/setting")}
          className="flex gap-4 p-4 items-center hover:bg-[#fbfdff] hover:shadow cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
              clipRule="evenodd"
            />
          </svg>
          <p className="font-medium text-base">Setting</p>
        </div>
        <div
          onClick={() => goToPage("/collections")}
          className="flex gap-4 p-4 items-center hover:bg-[#fbfdff] hover:shadow cursor-pointer"
        >
          <svg
            className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiSvgIcon-root MuiSvgIcon-fontSizeLarge css-1shn170"
            focusable="false"
            aria-hidden="true"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            data-testid="GridOnIcon"
            tabIndex="-1"
            title="GridOn"
          >
            <path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM8 20H4v-4h4v4zm0-6H4v-4h4v4zm0-6H4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4z"></path>
          </svg>
          <p className="font-medium text-base">My Collections</p>
        </div>
      </div>
      <div
        ref={hoverExploreMenuRef}
        className={`flex flex-col w-[245px] fixed right-24 top-[72px] shadow-md bg-white z-[1052] rounded-md transition ease-in-out${
          isHoveredExplore || isHoveredExploreMenu
            ? " h-auto"
            : " h-0 overflow-hidden"
        }`}
      >
        <div
          onClick={() => Router.push("/assets")}
          className="flex gap-4 p-4 items-center border-b hover:bg-[#fbfdff] hover:shadow cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 100 100"
          >
            <circle cx="50" cy="50" r="49.5" fill="#fff" stroke="#E5E8EB" />
            <path
              fill="#1868B7"
              d="M23 25C23 23.8954 23.8954 23 25 23H37C38.1046 23 39 23.8954 39 25V37C39 38.1046 38.1046 39 37 39H25C23.8954 39 23 38.1046 23 37V25Z"
            />
            <path
              fill="#2BCDE4"
              d="M23 44C23 42.8954 23.8954 42 25 42H37C38.1046 42 39 42.8954 39 44V56C39 57.1046 38.1046 58 37 58H25C23.8954 58 23 57.1046 23 56V44Z"
            />
            <path
              fill="#1868B7"
              d="M23 63C23 61.8954 23.8954 61 25 61H37C38.1046 61 39 61.8954 39 63V75C39 76.1046 38.1046 77 37 77H25C23.8954 77 23 76.1046 23 75V63Z"
            />
            <path
              fill="#2BCDE4"
              d="M42 25C42 23.8954 42.8954 23 44 23H56C57.1046 23 58 23.8954 58 25V37C58 38.1046 57.1046 39 56 39H44C42.8954 39 42 38.1046 42 37V25Z"
            />
            <path
              fill="#1868B7"
              d="M42 44C42 42.8954 42.8954 42 44 42H56C57.1046 42 58 42.8954 58 44V56C58 57.1046 57.1046 58 56 58H44C42.8954 58 42 57.1046 42 56V44Z"
            />
            <path
              fill="#2BCDE4"
              d="M42 63C42 61.8954 42.8954 61 44 61H56C57.1046 61 58 61.8954 58 63V75C58 76.1046 57.1046 77 56 77H44C42.8954 77 42 76.1046 42 75V63Z"
            />
            <path
              fill="#1868B7"
              d="M61 25C61 23.8954 61.8954 23 63 23H75C76.1046 23 77 23.8954 77 25V37C77 38.1046 76.1046 39 75 39H63C61.8954 39 61 38.1046 61 37V25Z"
            />
            <path
              fill="#2BCDE4"
              d="M61 44C61 42.8954 61.8954 42 63 42H75C76.1046 42 77 42.8954 77 44V56C77 57.1046 76.1046 58 75 58H63C61.8954 58 61 57.1046 61 56V44Z"
            />
            <path
              fill="#1868B7"
              d="M61 63C61 61.8954 61.8954 61 63 61H75C76.1046 61 77 61.8954 77 63V75C77 76.1046 76.1046 77 75 77H63C61.8954 77 61 76.1046 61 75V63Z"
            />
          </svg>
          <p className="font-medium text-base">All NFTs</p>
        </div>
        <div
          onClick={() => Router.push("/collectibles")}
          className="flex gap-4 p-4 items-center hover:bg-[#fbfdff] hover:shadow cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 100 100"
          >
            <circle cx="50" cy="50" r="49.5" fill="#fff" stroke="#E5E8EB" />
            <path
              fill="#2BCDE4"
              d="M26.2922 26.7923C26.2922 21.3842 30.6764 17 36.0845 17C41.4927 17 45.8769 21.3842 45.8769 26.7923V54.0276C45.8769 54.6411 45.3795 55.1385 44.766 55.1385H27.4031C26.7896 55.1385 26.2922 54.6411 26.2922 54.0276V26.7923Z"
            />
            <path
              fill="#1868B7"
              d="M32.4768 28.4759C32.4768 26.4834 34.092 24.8682 36.0845 24.8682C38.077 24.8682 39.6922 26.4834 39.6922 28.4759V49.2287C39.6922 51.2212 38.077 52.8364 36.0845 52.8364C34.092 52.8364 32.4768 51.2212 32.4768 49.2287V28.4759Z"
            />
            <path
              fill="#2BCDE4"
              d="M54.123 26.7923C54.123 21.3842 58.5072 17 63.9154 17C69.3235 17 73.7077 21.3842 73.7077 26.7923V54.0276C73.7077 54.6411 73.2103 55.1385 72.5968 55.1385H55.2339C54.6204 55.1385 54.123 54.6411 54.123 54.0276V26.7923Z"
            />
            <path
              fill="#1868B7"
              d="M60.3076 28.4759C60.3076 26.4834 61.9228 24.8682 63.9153 24.8682C65.9078 24.8682 67.523 26.4834 67.523 28.4759V49.2287C67.523 51.2212 65.9078 52.8364 63.9153 52.8364C61.9228 52.8364 60.3076 51.2212 60.3076 49.2287V28.4759Z"
            />
            <path
              fill="#2BCDE4"
              d="M22.3379 62.6858C25.0664 53.51 29.7314 44.3509 39.0517 42.1663C42.0474 41.4642 45.6665 41 50 41C54.3335 41 57.9526 41.4642 60.9483 42.1663C70.2686 44.3509 74.9336 53.51 77.6621 62.6858C80.8241 73.3196 72.8574 84 61.7634 84H38.2366C27.1426 84 19.1759 73.3196 22.3379 62.6858Z"
            />
            <path
              fill="#1868B7"
              d="M68.5538 65.9616C68.5538 67.954 66.9385 69.5693 64.9461 69.5693C62.9536 69.5693 61.3384 67.954 61.3384 65.9616C61.3384 63.9691 62.9536 62.3539 64.9461 62.3539C66.9385 62.3539 68.5538 63.9691 68.5538 65.9616Z"
            />
            <path
              fill="#1868B7"
              d="M37.6307 65.9616C37.6307 67.954 36.0154 69.5693 34.023 69.5693C32.0305 69.5693 30.4153 67.954 30.4153 65.9616C30.4153 63.9691 32.0305 62.3539 34.023 62.3539C36.0154 62.3539 37.6307 63.9691 37.6307 65.9616Z"
            />
            <path
              fill="#1868B7"
              fillRule="evenodd"
              d="M49.9069 71.3966L49.9058 71.3934L49.9047 71.3898L49.9029 71.3844C49.9025 71.3831 49.9022 71.3821 49.902 71.3815C49.9018 71.381 49.9019 71.3813 49.902 71.3815C49.9021 71.3818 49.9021 71.3819 49.9025 71.3828C49.9039 71.3874 49.9054 71.392 49.9069 71.3966ZM50 71.6167C49.9847 71.5843 49.9705 71.5527 49.9576 71.5227C49.934 71.4678 49.9177 71.425 49.9088 71.4007C49.9056 71.3918 49.9034 71.3857 49.9025 71.3828C49.564 70.3389 48.4461 69.7618 47.3978 70.0928C46.3445 70.4254 45.7603 71.549 46.0929 72.6022L48 72C46.0929 72.6022 46.0931 72.6028 46.0933 72.6034L46.0945 72.6073L46.0963 72.6131L46.1009 72.627L46.1131 72.6639C46.1227 72.6923 46.1353 72.7284 46.1509 72.7711C46.1819 72.8563 46.2257 72.9697 46.2827 73.1023C46.3941 73.3616 46.5686 73.7231 46.8161 74.0992C47.24 74.7436 48.2621 76 50 76C51.738 76 52.7601 74.7436 53.184 74.0992C53.4315 73.7231 53.606 73.3616 53.7174 73.1023C53.7744 72.9697 53.8182 72.8563 53.8492 72.7711C53.8648 72.7284 53.8774 72.6923 53.887 72.6639L53.8992 72.627L53.9038 72.6131L53.9056 72.6073L53.9068 72.6034C53.907 72.6028 53.9072 72.6022 52 72L53.9072 72.6022C54.2398 71.549 53.6556 70.4254 52.6023 70.0928C51.554 69.7618 50.4361 70.3389 50.0976 71.3828C50.0967 71.3857 50.0945 71.3918 50.0913 71.4007C50.0824 71.425 50.0661 71.4678 50.0425 71.5227C50.0296 71.5527 50.0154 71.5843 50 71.6167Z"
              clipRule="evenodd"
            />
          </svg>
          <p className="font-medium text-base">Collectibles</p>
        </div>
      </div>
      <nav className="flex justify-between shadow-md fixed w-full z-[1051] bg-white items-center">
        <Link href="/">
          <div className="flex gap-2 p-4 ml-2 items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              fill="none"
              viewBox="0 0 100 100"
            >
              <path
                fill="#2081E2"
                d="M100 50C100 77.6127 77.6127 100 50 100C22.3873 100 0 77.6127 0 50C0 22.3873 22.3873 0 50 0C77.6185 0 100 22.3873 100 50Z"
              />
              <path
                fill="#fff"
                d="M24.6679 51.6801L24.8836 51.341L37.8906 30.9932C38.0807 30.6953 38.5276 30.7261 38.6714 31.0497C40.8444 35.9196 42.7194 41.9762 41.841 45.7468C41.466 47.2982 40.4386 49.3992 39.2827 51.341C39.1338 51.6236 38.9694 51.901 38.7947 52.1681C38.7125 52.2914 38.5738 52.3633 38.4248 52.3633H25.048C24.6884 52.3633 24.4778 51.9729 24.6679 51.6801Z"
              />
              <path
                fill="#fff"
                d="M82.6444 55.461V58.6819C82.6444 58.8668 82.5314 59.0312 82.367 59.1031C81.3602 59.5346 77.9132 61.1168 76.48 63.11C72.8224 68.2008 70.0279 75.48 63.7812 75.48H37.721C28.4847 75.48 21 67.9697 21 58.7024V58.4045C21 58.1579 21.2003 57.9576 21.4469 57.9576H35.9745C36.2621 57.9576 36.4727 58.2247 36.4471 58.5072C36.3443 59.4524 36.519 60.4182 36.9659 61.2966C37.8289 63.0484 39.6166 64.1426 41.5481 64.1426H48.74V58.5278H41.6303C41.2656 58.5278 41.0499 58.1065 41.2605 57.8086C41.3375 57.6904 41.4249 57.5672 41.5173 57.4285C42.1903 56.473 43.1509 54.9884 44.1064 53.2983C44.7588 52.1579 45.3906 50.9404 45.8992 49.7178C46.002 49.4969 46.0841 49.2708 46.1663 49.0499C46.305 48.6595 46.4489 48.2948 46.5516 47.9301C46.6544 47.6218 46.7365 47.2982 46.8187 46.9951C47.0602 45.9574 47.1629 44.8581 47.1629 43.7177C47.1629 43.2708 47.1424 42.8033 47.1013 42.3564C47.0807 41.8684 47.0191 41.3803 46.9574 40.8923C46.9163 40.4608 46.8393 40.0344 46.7571 39.5875C46.6544 38.9351 46.5105 38.2879 46.3461 37.6354L46.2896 37.3889C46.1663 36.9419 46.0636 36.5156 45.9198 36.0687C45.5139 34.6662 45.0465 33.2998 44.5533 32.0207C44.3735 31.5121 44.168 31.0241 43.9625 30.5361C43.6595 29.8015 43.3512 29.1337 43.0687 28.5018C42.9249 28.2141 42.8016 27.9521 42.6783 27.685C42.5396 27.3819 42.3958 27.0788 42.2519 26.7912C42.1492 26.5703 42.031 26.3648 41.9488 26.1593L41.0704 24.536C40.9471 24.3151 41.1526 24.0531 41.394 24.1199L46.8907 25.6096H46.9061C46.9163 25.6096 46.9215 25.6148 46.9266 25.6148L47.6509 25.8151L48.4472 26.0412L48.74 26.1233V22.8562C48.74 21.2791 50.0037 20 51.5654 20C52.3462 20 53.0551 20.3185 53.5637 20.8373C54.0722 21.3562 54.3907 22.0651 54.3907 22.8562V27.7056L54.9764 27.8699C55.0226 27.8854 55.0688 27.9059 55.1099 27.9367C55.2538 28.0446 55.4592 28.2038 55.7212 28.3991C55.9267 28.5634 56.1476 28.7638 56.4147 28.9693C56.9438 29.3956 57.5757 29.9453 58.2692 30.5772C58.4541 30.7364 58.6339 30.9008 58.7983 31.0652C59.6922 31.8974 60.6939 32.8734 61.6494 33.9522C61.9165 34.2553 62.1785 34.5635 62.4456 34.8871C62.7127 35.2159 62.9953 35.5395 63.2418 35.8632C63.5655 36.2947 63.9148 36.7416 64.2179 37.2091C64.3617 37.43 64.5261 37.656 64.6648 37.8769C65.0552 38.4676 65.3994 39.079 65.7282 39.6903C65.8669 39.9728 66.0107 40.281 66.134 40.5841C66.4987 41.4009 66.7864 42.2331 66.9713 43.0653C67.0278 43.2451 67.0689 43.4403 67.0895 43.615V43.6561C67.1511 43.9026 67.1717 44.1646 67.1922 44.4317C67.2744 45.2845 67.2333 46.1372 67.0484 46.9951C66.9713 47.3599 66.8686 47.704 66.7453 48.0688C66.622 48.4181 66.4987 48.7828 66.3395 49.127C66.0313 49.841 65.6665 50.5551 65.235 51.2229C65.0963 51.4695 64.9319 51.7315 64.7675 51.9781C64.5877 52.24 64.4028 52.4866 64.2384 52.7281C64.0124 53.0363 63.771 53.3599 63.5244 53.6476C63.3035 53.9507 63.0775 54.2538 62.8309 54.5209C62.4867 54.9267 62.1579 55.312 61.8137 55.6819C61.6083 55.9233 61.3874 56.1699 61.1613 56.3908C60.9405 56.6373 60.7144 56.8582 60.5089 57.0637C60.1648 57.4079 59.8771 57.675 59.6356 57.8959L59.0706 58.4148C58.9884 58.4867 58.8805 58.5278 58.7675 58.5278H54.3907V64.1426H59.8976C61.1305 64.1426 62.3018 63.7059 63.247 62.9045C63.5706 62.622 64.9833 61.3994 66.6528 59.5552C66.7093 59.4935 66.7813 59.4473 66.8635 59.4268L82.0742 55.0295C82.3568 54.9473 82.6444 55.163 82.6444 55.461Z"
              />
            </svg>
            <p className="text-xl font-extrabold cursor-pointer">OpenSky</p>
          </div>
        </Link>
        <div className="flex items-center">
          <SearchBar />
          <p
            ref={hoverExploreRef}
            onClick={() => Router.push("/collectibles")}
            className={`${
              isHoveredExplore || isHoveredExploreMenu
                ? "text-gray-800"
                : "text-gray-500"
            } text-base font-semibold mt-0 cursor-pointer p-6`}
          >
            Explore
          </p>
          <p
            onClick={() => goToPage("/create")}
            className="text-gray-500 hover:text-gray-800 text-base font-semibold mt-0 cursor-pointer p-6"
          >
            Create
          </p>
          <div
            onClick={() => goToPage("/account")}
            className={`px-6 py-5 cursor-pointer`}
            ref={hoverProfileRef}
          >
            {isActive ? (
              <div className="w-[32px] h-[32px] rounded-[50%] border-2 flex justify-center items-center">
                <div className="w-[26px] h-[26px] rounded-[50%] relative overflow-hidden">
                  {userData?.image ? (
                    <Image
                      layout="fill"
                      objectFit="cover"
                      src={userData?.image}
                      alt="avatar-nav"
                    />
                  ) : (
                    <></>
                  )}
                </div>
              </div>
            ) : (
              <svg
                className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiSvgIcon-root MuiSvgIcon-fontSizeLarge css-1shn170"
                focusable="false"
                width="32"
                height="32"
                aria-hidden="true"
                viewBox="0 0 24 24"
                data-testid="AccountCircleOutlinedIcon"
                tabIndex="-1"
                title="AccountCircleOutlined"
                fill={
                  isHoveredProfile || isHoveredProfileMenu
                    ? "rgb(53, 56, 64)"
                    : "rgb(112, 122, 131)"
                }
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM7.07 18.28c.43-.9 3.05-1.78 4.93-1.78s4.51.88 4.93 1.78C15.57 19.36 13.86 20 12 20s-3.57-.64-4.93-1.72zm11.29-1.45c-1.43-1.74-4.9-2.33-6.36-2.33s-4.93.59-6.36 2.33C4.62 15.49 4 13.82 4 12c0-4.41 3.59-8 8-8s8 3.59 8 8c0 1.82-.62 3.49-1.64 4.83zM12 6c-1.94 0-3.5 1.56-3.5 3.5S10.06 13 12 13s3.5-1.56 3.5-3.5S13.94 6 12 6zm0 5c-.83 0-1.5-.67-1.5-1.5S11.17 8 12 8s1.5.67 1.5 1.5S12.83 11 12 11z"></path>
              </svg>
            )}
          </div>
          <div
            onClick={handleWalletDrawerOpen}
            className={`px-5 cursor-pointer ${
              !isDrawerOpen ? "text-gray-500" : "text-gray-800"
            } hover:text-gray-800`}
          >
            <svg
              className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiSvgIcon-root MuiSvgIcon-fontSizeLarge css-1shn170"
              focusable="false"
              aria-hidden="true"
              height="32"
              width="32"
              viewBox="0 0 24 24"
              data-testid="AccountBalanceWalletOutlinedIcon"
              tabIndex="-1"
              title="AccountBalanceWalletOutlined"
              fill="currentColor"
            >
              <path d="M21 7.28V5c0-1.1-.9-2-2-2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-2.28c.59-.35 1-.98 1-1.72V9c0-.74-.41-1.37-1-1.72zM20 9v6h-7V9h7zM5 19V5h14v2h-6c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h6v2H5z"></path>
              <circle cx="16" cy="12" r="1.5"></circle>
            </svg>
          </div>
        </div>
      </nav>
      {isActive && chainId !== 4 ? (
        <div className="flex justify-center w-full bg-orange-400 fixed top-[72px] py-2 text-xs">
          <div className="w-max-md font-medium flex gap-1">
            You&apos;re viewing data from the test network, but your wallet is
            connected to the {CHAINS[chainId].name} network (Ethereum). To use
            NFT Marketplace, please switch into Rinkeby test network{" "}
            <div
              className="underline cursor-pointer hover:text-blue-500"
              onClick={() => {
                connector
                  .activate(4)
                  .then()
                  .catch((e) => console.log("Cant switch network", e));
              }}
            >
              here
            </div>
            .
          </div>
        </div>
      ) : (
        <></>
      )}
    </>
  );
}

export default Header;
