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

function Header() {
  const router = useRouter();
  const currentLink = router.pathname;
  const { isActive, chainId } = useWeb3React();
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

  return (
    <>
      <Drawer
        open={isDrawerOpen}
        onClose={() => closeDrawer(drawerDispatch)}
        size="xs"
      >
        <Drawer.Header className={styles.drawerTitle}>
          <Drawer.Title>
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
          </Drawer.Title>
        </Drawer.Header>
        <Drawer.Body style={{ padding: "20px" }}>
          <p className="text-gray-500 text-base mb-8">
            Connect with one of our available wallet providers or create a new
            one.
          </p>
          <WalletList referrer={referrer} />
        </Drawer.Body>
      </Drawer>
      {/* <div className="flex flex-col w-[245px] fixed right-0 top-[73px] shadow-md bg-white z-[1052] rounded-md">
        <div className="flex gap-2 p-4 items-center border-b">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clipRule="evenodd"
            />
          </svg>
          <p>Profile</p>
        </div>
        <div className="flex gap-2 p-4 items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
              clipRule="evenodd"
            />
          </svg>
          <p>Setting</p>
        </div>
      </div> */}
      <nav className="flex p-4 justify-between shadow-lg fixed w-full z-[1051] bg-white items-center">
        <Link href="/">
          <p className="text-xl font-bold cursor-pointer">NFT Marketplace</p>
        </Link>
        <div className="flex mt-4 items-center">
          <p
            onClick={() => goToPage("/create")}
            className="mr-6 text-gray-400 hover:text-gray-500 text-base font-medium cursor-pointer"
          >
            Create
          </p>
          <p
            onClick={() => goToPage("/account")}
            className="mr-6 text-gray-400 hover:text-gray-500 text-base font-medium mt-0 cursor-pointer"
          >
            Profile
          </p>
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
                setReferrer(currentLink);
                openDrawer(drawerDispatch);
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
