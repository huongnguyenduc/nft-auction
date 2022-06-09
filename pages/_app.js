import "tailwindcss/tailwind.css";
import "../styles/globals.css";
import "rsuite/dist/rsuite.min.css";
import Head from "next/head";
import Header from "../components/Header/Header";
import Footer from "../components/Footer";
import { Web3ReactProvider } from "@web3-react/core";
import { DrawerProvider } from "../components/useDrawer";
import { connectors } from "../utils/web3";

function MyApp({ Component, pageProps }) {
  return (
    <Web3ReactProvider connectors={connectors}>
      <DrawerProvider>
        <Head>
          <title>NFT Marketplace</title>
          <meta
            name="viewport"
            content="minimum-scale=1, initial-scale=1, width=device-width"
          />
        </Head>

        <Header />
        <div className="py-16 min-h-[calc(100vh-52px)]">
          <Component {...pageProps} />
        </div>

        <Footer />
      </DrawerProvider>
    </Web3ReactProvider>
  );
}

export default MyApp;
