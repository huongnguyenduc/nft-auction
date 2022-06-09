import React from "react";
import Router from "next/router";
import { useDrawerDispatch, closeDrawer } from "./useDrawer";
import MetaMaskCard from "./Wallet/Metamask";
import CoinbaseWalletCard from "./Wallet/Coinbase";
import WalletConnectCard from "./Wallet/WalletConnect";

const WalletList = ({ referrer }) => {
  return (
    <>
      <MetaMaskCard referrer={referrer} />
      <CoinbaseWalletCard referrer={referrer} />
      <WalletConnectCard referrer={referrer} />
    </>
  );
};

export default WalletList;
