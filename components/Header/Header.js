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

      <nav className="flex p-4 justify-between shadow-lg fixed w-full z-[100000] bg-white">
        <Link href="/">
          <p className="text-xl font-bold cursor-pointer">NFT Marketplace</p>
        </Link>
        <div className="flex mt-4">
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
