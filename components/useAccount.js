import { useEffect, useState } from "react";

export default function useAccount() {
  const [account, setAccount] = useState("0x0");
  useEffect(
    () => {
      if (!window.ethereum) {
        // Nothing to do here... no ethereum provider found
        return;
      }
      const accountWasChanged = (accounts) => {
        setAccount(accounts[0]);
        console.log("accountWasChanged");
      };
      const getAndSetAccount = async () => {
        const changedAccounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(changedAccounts[0]);
        console.log("getAndSetAccount");
      };
      const clearAccount = () => {
        setAccount("0x0");
        console.log("clearAccount");
      };
      window.ethereum.on("accountsChanged", accountWasChanged);
      window.ethereum.on("connect", getAndSetAccount);
      window.ethereum.on("disconnect", clearAccount);
      window.ethereum.request({ method: "eth_requestAccounts" }).then(
        (accounts) => {
          console.log("accounts", accounts);
          // No need to set account here, it will be set by the event listener
        },
        (error) => {
          // Handle any UI for errors here, e.g. network error, rejected request, etc.
          // Set state as needed
          console.log("Error account: ", error);
        }
      );
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
  return account;
}
