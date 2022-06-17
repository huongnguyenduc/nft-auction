import MetaMaskCard from "./Wallet/Metamask";
import CoinbaseWalletCard from "./Wallet/Coinbase";
import WalletConnectCard from "./Wallet/WalletConnect";

const WalletList = ({ referrer, needSign }) => {
  return (
    <>
      <MetaMaskCard referrer={referrer} needSign={needSign} />
      <CoinbaseWalletCard referrer={referrer} needSign={needSign} />
      <WalletConnectCard referrer={referrer} needSign={needSign} />
    </>
  );
};

export default WalletList;
