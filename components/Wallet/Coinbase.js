import { useEffect, useState } from "react";
import { coinbaseWallet, hooks } from "../../connectors/coinbaseWallet";
import { WalletContainer } from "./Wallet";

const {
  useChainId,
  useAccounts,
  useIsActivating,
  useIsActive,
  useProvider,
  useENSNames,
  useAccount,
} = hooks;

export default function CoinbaseWalletCard({ referrer, needSign }) {
  const chainId = useChainId();
  const accounts = useAccounts();
  const account = useAccount();
  const isActivating = useIsActivating();

  const isActive = useIsActive();

  const provider = useProvider();
  const ENSNames = useENSNames(provider);

  const [error, setError] = useState(undefined);

  // attempt to connect eagerly on mount
  // useEffect(() => {
  //   void coinbaseWallet.connectEagerly().catch(() => {
  //     console.debug("Failed to connect eagerly to coinbase wallet");
  //   });
  // }, []);

  return (
    <WalletContainer
      needSign={needSign}
      connector={coinbaseWallet}
      chainId={chainId}
      isActivating={isActivating}
      isActive={isActive}
      error={error}
      setError={setError}
      accounts={accounts}
      account={account}
      provider={provider}
      ENSNames={ENSNames}
      referrer={referrer}
    />
  );
}
