import { URI_AVAILABLE } from "@web3-react/walletconnect";
import { useEffect, useState } from "react";
import { hooks, walletConnect } from "../../connectors/walletConnect";
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

export default function WalletConnectCard({ referrer, needSign }) {
  const chainId = useChainId();
  const accounts = useAccounts();
  const account = useAccount();
  const isActivating = useIsActivating();

  const isActive = useIsActive();

  const provider = useProvider();
  const ENSNames = useENSNames(provider);

  const [error, setError] = useState(undefined);

  // log URI when available
  useEffect(() => {
    walletConnect.events.on(URI_AVAILABLE, (uri) => {
      console.log(`uri: ${uri}`);
    });
  }, []);

  // attempt to connect eagerly on mount
  // useEffect(() => {
  //   walletConnect.connectEagerly().catch(() => {
  //     console.debug("Failed to connect eagerly to walletconnect");
  //   });
  // }, []);

  return (
    <WalletContainer
      needSign={needSign}
      connector={walletConnect}
      chainId={chainId}
      isActivating={isActivating}
      isActive={isActive}
      error={error}
      account={account}
      setError={setError}
      accounts={accounts}
      provider={provider}
      ENSNames={ENSNames}
      referrer={referrer}
    />
  );
}
