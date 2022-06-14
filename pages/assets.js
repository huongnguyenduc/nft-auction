import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
// import Web3Modal from "web3modal";
import { SelectPicker } from "rsuite";
import NFTItem from "../components/NFTItem";
import styles from "../components/Assets/Assets.module.css";

const marketplaceAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const erc1155Address = process.env.NEXT_PUBLIC_ERC1155_CONTRACT_ADDRESS;
const erc721Address = process.env.NEXT_PUBLIC_ERC721_CONTRACT_ADDRESS;

import NFTMarketplace from "../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";
import LoadingPage from "../components/Loading";
// import { axiosFetcher } from "../utils/fetcher";

export default function Home() {
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");
  useEffect(() => {
    loadNFTs();
  }, []);
  async function loadNFTs() {
    // const web3Modal = new Web3Modal();
    // const connection = await web3Modal.connect();
    // const provider = new ethers.providers.Web3Provider(connection);
    const network = "rinkeby"; // use rinkeby testnet
    const provider = ethers.getDefaultProvider(network);
    const contract = new ethers.Contract(
      marketplaceAddress,
      NFTMarketplace.abi,
      provider
    );
    const data = await contract.fetchAvailableMarketItems();

    const items = await Promise.all(
      data.map(async (i) => {
        const tokenUri = i.isMultiToken
          ? await contract.get1155TokenURI(i.tokenId.toString(), erc1155Address)
          : await contract.get721TokenURI(i.tokenId.toString(), erc721Address);
        const meta = await axios.get(tokenUri);
        let price = ethers.utils.formatUnits(i.price.toString(), "ether");
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description,
          tokenUri: tokenUri,
          isMultiToken: i.isMultiToken,
          auctionInfo: i.auctionInfo,
          sold: i.sold,
          bidded: i.bidded,
        };
        return item;
      })
    );
    setNfts(items);
    setLoadingState("loaded");
  }
  const [isOpenFilter, setIsOpenFilter] = useState(true);
  const toggleFilter = () => setIsOpenFilter((state) => !state);
  const [isMoreGrid, setIsMoreGrid] = useState(false);
  if (loadingState === "not-loaded") return <LoadingPage />;
  if (loadingState === "loaded" && !nfts.length)
    return <h1 className="px-20 py-10 text-3xl">No items in marketplace</h1>;
  return (
    <>
      <div className="sticky z-[1050] w-full px-8 border-b top-[72px] bg-white h-[65px] flex justify-between items-center">
        <div
          onClick={toggleFilter}
          className="p-3 rounded-[50%] hover:shadow-lg cursor-pointer flex justify-center items-center"
        >
          <svg
            className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiSvgIcon-root MuiSvgIcon-fontSizeLarge css-1shn170"
            focusable="false"
            width="24"
            height="24"
            aria-hidden="true"
            viewBox="0 0 24 24"
            data-testid="FilterListIcon"
            tabIndex="-1"
            title="FilterList"
          >
            <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"></path>
          </svg>
        </div>
        <div className="flex items-center h-full gap-4">
          <SelectPicker
            className={styles.customSelectPicker}
            data={[{ label: "Recently Listed", value: "Listed" }]}
            searchable={false}
            placeholder="Sort by"
            style={{ width: 224 }}
            size="lg"
          />
          <div className="flex border-2 rounded-lg">
            <div
              onClick={() => {
                setIsMoreGrid(false);
              }}
              className={`p-[12px]  border-r-2${
                !isMoreGrid ? " bg-gray-100" : " cursor-pointer hover:shadow-lg"
              }`}
            >
              <svg
                className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiSvgIcon-root MuiSvgIcon-fontSizeLarge css-1shn170"
                focusable="false"
                aria-hidden="true"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                data-testid="WindowIcon"
                tabIndex="-1"
                title="Window"
              >
                <path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 9h-7V4h7v7zm-9-7v7H4V4h7zm-7 9h7v7H4v-7zm9 7v-7h7v7h-7z"></path>
              </svg>
            </div>
            <div
              onClick={() => {
                setIsMoreGrid(true);
              }}
              className={`p-[12px]${
                isMoreGrid ? " bg-gray-100" : " cursor-pointer hover:shadow-lg"
              }`}
            >
              <svg
                className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiSvgIcon-root MuiSvgIcon-fontSizeLarge css-1shn170"
                focusable="false"
                aria-hidden="true"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                data-testid="GridOnIcon"
                tabIndex="-1"
                title="GridOn"
              >
                <path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM8 20H4v-4h4v4zm0-6H4v-4h4v4zm0-6H4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-center">
        <div className="flex w-full px-8 max-w-[1600px]">
          <div
            className={`w-[180px] lg:w-[240px] xl:w-[300px] pt-2 pr-4 mr-4 border-r sticky top-[137px] h-[70vh] ${
              isOpenFilter ? "" : "hidden"
            }`}
          >
            <p className="text-base font-semibold px-2 py-4">Status</p>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center h-[48px] hover:bg-gray-100 rounded-xl px-2 py-4 cursor-pointer">
                <p className="text-base text-gray-600 font-base">Buy Now</p>
                <input type="checkbox" className="h-6 w-6 cursor-pointer" />
              </div>
              <div className="flex justify-between items-center h-[48px] hover:bg-gray-100 rounded-xl px-2 py-4 cursor-pointer">
                <p className="text-base text-gray-600 font-base">On Auction</p>
                <input type="checkbox" className="h-6 w-6 cursor-pointer" />
              </div>
            </div>
          </div>
          <div
            className={`grid gap-4 flex-1 py-12 ${
              isMoreGrid
                ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                : " grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {nfts.map((nft, i) => (
              <NFTItem nft={nft} key={nft.toString() + i.toString()} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
