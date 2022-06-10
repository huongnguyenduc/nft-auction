import { useEffect, useState } from "react";
import { formatEther } from "@ethersproject/units";

export default function useBalance(provider, account) {
  const [balance, setBalance] = useState();

  useEffect(() => {
    if (provider && account) {
      let stale = false;

      provider.getBalance(account).then((balance) => {
        if (stale) return;
        setBalance(balance);
      });

      return () => {
        stale = true;
        setBalance(undefined);
      };
    }
  }, [provider, account]);

  return balance ? formatEther(balance) : balance;
}
