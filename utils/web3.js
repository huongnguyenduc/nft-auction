import { ethers } from "ethers";
import { CoinbaseWallet } from "@web3-react/coinbase-wallet";
import { MetaMask } from "@web3-react/metamask";
import { Network } from "@web3-react/network";
import { WalletConnect } from "@web3-react/walletconnect";
import {
  coinbaseWallet,
  hooks as coinbaseWalletHooks,
} from "../connectors/coinbaseWallet";
import { hooks as metaMaskHooks, metaMask } from "../connectors/metaMask";
import { hooks as networkHooks, network } from "../connectors/network";
import {
  hooks as walletConnectHooks,
  walletConnect,
} from "../connectors/walletConnect";

export function getName(connector) {
  if (connector instanceof MetaMask) return "MetaMask";
  if (connector instanceof WalletConnect) return "WalletConnect";
  if (connector instanceof CoinbaseWallet) return "Coinbase Wallet";
  if (connector instanceof Network) return "Network";
  return "Unknown";
}

export function getImage(connector) {
  if (connector instanceof MetaMask)
    return "https://testnets.opensea.io/static/images/logos/metamask-fox.svg";
  if (connector instanceof WalletConnect)
    return "https://static.opensea.io/logos/walletconnect-alternative.png";
  if (connector instanceof CoinbaseWallet)
    return "https://static.opensea.io/logos/walletlink-alternative.png";
  return "Unknown";
}

export const connectors = [
  [metaMask, metaMaskHooks],
  [walletConnect, walletConnectHooks],
  [coinbaseWallet, coinbaseWalletHooks],
  [network, networkHooks],
];

export function convertWeiToEther(wei) {
  if (wei.toString() === "") {
    return "";
  }
  return ethers.utils.formatEther(wei.toString());
}
