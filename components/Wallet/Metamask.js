import { useEffect, useState } from "react";
import { hooks, metaMask } from "../../connectors/metaMask";
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

export default function MetaMaskCard({ referrer, needSign }) {
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
  //   void metaMask.connectEagerly().catch(() => {
  //     console.debug("Failed to connect eagerly to metamask");
  //   });
  // }, []);

  return (
    <WalletContainer
      needSign={needSign}
      connector={metaMask}
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
