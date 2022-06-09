import { useEffect, useState } from "react";
import { ethers } from "ethers";

export default function useAccount() {
  const [account, setAccount] = useState("0x0");
  const [balance, setBalance] = useState("0");
  const network = "rinkeby"; // use rinkeby testnet
  const provider = ethers.getDefaultProvider(network);
  useEffect(
    () => {
      if (!window.ethereum) {
        // Nothing to do here... no ethereum provider found
        return;
      }
      const accountWasChanged = async (accounts) => {
        setAccount(accounts[0]);
        console.log("accountWasChanged");
        if (accounts[0] === "0x0") {
          setBalance(0);
        } else {
          const balanceWei = await provider.getBalance(accounts[0]);
          const balanceEth = ethers.utils.formatEther(balanceWei);
          setBalance(balanceEth);
        }
      };
      const getAndSetAccount = async () => {
        const changedAccounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(changedAccounts[0]);
        console.log("getAndSetAccount");
        if (changedAccounts[0] === "0x0") {
          setBalance(0);
        } else {
          const balanceWei = await provider.getBalance(changedAccounts[0]);
          const balanceEth = ethers.utils.formatEther(balanceWei);
          setBalance(balanceEth);
        }
      };
      const clearAccount = () => {
        setAccount("0x0");
        setBalance(0);
        console.log("clearAccount");
      };
      window.ethereum.on("accountsChanged", accountWasChanged);
      window.ethereum.on("connect", getAndSetAccount);
      window.ethereum.on("disconnect", clearAccount);
      // window.ethereum.request({ method: "eth_requestAccounts" }).then(
      //   async (accounts) => {
      //     console.log("accounts", accounts);
      //     // No need to set account here, it will be set by the event listener
      //     setAccount(accounts[0]);
      //     if (accounts[0] === "0x0") {
      //       setBalance(0);
      //     } else {
      //       const balanceWei = await provider.getBalance(accounts[0]);
      //       const balanceEth = ethers.utils.formatEther(balanceWei);
      //       setBalance(balanceEth);
      //     }
      //   },
      //   (error) => {
      //     // Handle any UI for errors here, e.g. network error, rejected request, etc.
      //     // Set state as needed
      //     console.log("Error account: ", error);
      //   }
      // );
      return () => {
        // Return function of a non-async useEffect will clean up on component leaving screen, or from re-reneder to due dependency change
        window.ethereum.removeListener("accountsChanged", accountWasChanged);
        window.ethereum.removeListener("connect", getAndSetAccount);
        window.ethereum.removeListener("disconnect", clearAccount);
      };
    },
    [
      /* empty array to avoid re-request on every render, but if you have state related to a connect button, put here */
    ]
  );
  return { account, balance };
}
