import "tailwindcss/tailwind.css";
import "../styles/globals.css";
import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>NFT Marketplace</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
        <link rel="shortcut icon" href="/favicon.svg" />
      </Head>

      <Header />
      <div className="py-16">
        <Component {...pageProps} />
      </div>
      <Footer />
    </>
  );
}

export default MyApp;
