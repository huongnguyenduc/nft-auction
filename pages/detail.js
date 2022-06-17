import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { ethers } from "ethers";
import NFTMarketplace from "../contracts/NFTMarketplace.json";
import Web3Modal from "web3modal";
import { useWeb3React } from "@web3-react/core";
import { Modal } from "rsuite";
import { isNumeric, getShortAddress } from "../utils/utils";
import { convertWeiToEther } from "../utils/web3";
import LoadingPage from "../components/Loading";
import useBalance from "../components/useBalance";
import styles from "../components/Modal/Modal.module.css";
import { useToaster } from "rsuite";
import NotificationUI from "../components/Notification";
import LoadingUI from "../components/LoadingUI";
import { axiosFetcher } from "../utils/fetcher";
import { useDrawerDispatch, openDrawer } from "../components/useDrawer";
import ApiClient, { verifyUser } from "../utils/ApiClient";

const marketplaceAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

const dateOptions = {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  timeZone: "GMT",
  timeZoneName: "shortOffset",
};

const initialNFT = {
  nftContract: "",
  seller: "",
  owner: "",
  price: "",
  sold: "",
  bidded: "",
  image: "",
  name: "",
  description: "",
  isMultiToken: "",
  auctionInfo: {
    startAt: "",
    endAt: "",
    highestBid: "",
    highestBidder: "",
    highestBidTime: "",
    bids: [],
    startingPrice: "",
  },
};

function NFTDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { account: userAccount, provider, isActive } = useWeb3React();
  const drawerDispatch = useDrawerDispatch();
  const userBalance = useBalance(provider, userAccount);
  const [openBidModal, setOpenBidModal] = useState(false);
  const handleOpenModal = () => {
    if (!isActive) {
      openDrawer(drawerDispatch);
    } else setOpenBidModal(true);
  };
  const handleCloseModal = () => setOpenBidModal(false);
  const toaster = useToaster();
  const [hasBidRequesting, setHasBidRequesting] = useState(false);
  const [hasBuyRequesting, setHasBuyRequesting] = useState("onSale");
  const [buyError, setBuyError] = useState();
  const [openBuyModal, setOpenBuyModal] = useState(false);
  const handleOpenBuyModal = () => {
    if (!isActive) {
      openDrawer(drawerDispatch);
    } else setOpenBuyModal(true);
  };
  const handleCloseBuyModal = () => {
    setOpenBuyModal(false);
    setHasBuyRequesting("onSale");
    setBuyError();
  };

  const [hasCancelListRequesting, setHasCancelListRequesting] = useState(false);
  const [hasCancelBidRequesting, setHasCancelBidRequesting] = useState(false);

  const [nftData, setNftData] = useState(initialNFT);
  const { image, name, description, isMultiToken } = nftData;

  const [placeBidPrice, setPlaceBidPrice] = useState(
    nftData?.auctionInfo?.startingPrice
  );
  const [validateBidError, setValidateBidError] = useState("");

  async function fetchNFT() {
    const detailResponse = await axiosFetcher(`nft/id/${id}`);
    setNftData(detailResponse.data ? detailResponse.data : initialNFT);
  }

  useEffect(() => {
    if (id) {
      fetchNFT();
    }
  }, [id]);

  async function cancelListing() {
    if (!isActive) {
      openDrawer(drawerDispatch);
    } else
      try {
        await verifyUser(userAccount);
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        let contract = new ethers.Contract(
          marketplaceAddress,
          NFTMarketplace.abi,
          signer
        );
        setHasCancelListRequesting(true);
        let transaction = await contract.cancelListingItem(id);
        await transaction.wait();
        const cancelListRequest = await ApiClient(userAccount).patch(
          `/nft/cancel-list`,
          {
            tokenId: id,
          }
        );
        console.log("cancel List token", cancelListRequest);
        setHasCancelListRequesting(false);
        const successCode = toaster.push(
          <NotificationUI message="Cancel list successfully." type="success" />,
          { placement: "bottomStart" }
        );
        setTimeout(() => toaster.remove(successCode), 2500);
        await fetchNFT();
      } catch (error) {
        setHasCancelListRequesting(false);
        const failureCode = toaster.push(
          <NotificationUI message={error.message} type="error" />,
          { placement: "bottomStart" }
        );
        setTimeout(() => toaster.remove(failureCode), 2500);
      }
  }

  async function buyNft() {
    if (!isActive) {
      openDrawer(drawerDispatch);
    } else
      try {
        await verifyUser(userAccount);
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        let contract = new ethers.Contract(
          marketplaceAddress,
          NFTMarketplace.abi,
          signer
        );
        setHasBuyRequesting("buying");
        let transaction = await contract.createMarketSale(id, {
          value: nftData.price,
        });
        await transaction.wait();
        const buyTokenRequest = await ApiClient(userAccount).patch(`/nft/buy`, {
          tokenId: id,
        });
        console.log("buy token", buyTokenRequest);
        setHasBuyRequesting("done");
        await fetchNFT();
      } catch (error) {
        setHasBuyRequesting("error");
        setBuyError(error.message);
      }
  }

  async function bid() {
    if (!isActive) {
      openDrawer(drawerDispatch);
    } else
      try {
        await verifyUser(userAccount);
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const placeBidPriceFormatted = ethers.utils.parseUnits(
          placeBidPrice,
          "ether"
        );
        let contract = new ethers.Contract(
          marketplaceAddress,
          NFTMarketplace.abi,
          signer
        );
        setHasBidRequesting(true);
        let transaction = await contract.bid(id, {
          value: placeBidPriceFormatted,
        });
        await transaction.wait();
        const bidTokenRequest = await ApiClient(userAccount).patch(
          `/nft/place-bid`,
          {
            tokenId: id,
            bid: placeBidPriceFormatted.toString(),
            bidTime: new Date(),
          }
        );
        console.log("bid token", bidTokenRequest);
        setHasBidRequesting(false);
        await fetchNFT();
        handleCloseModal();
        const successCode = toaster.push(
          <NotificationUI
            message="Your offer has been submitted."
            type="success"
          />,
          { placement: "bottomStart" }
        );
        setTimeout(() => toaster.remove(successCode), 2500);
      } catch (error) {
        setHasBidRequesting(false);
        const failureCode = toaster.push(
          <NotificationUI message={error.message} type="error" />,
          { placement: "bottomStart" }
        );
        setTimeout(() => toaster.remove(failureCode), 2500);
      }
  }

  async function cancelBid() {
    if (!isActive) {
      openDrawer(drawerDispatch);
    } else
      try {
        await verifyUser(userAccount);
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        let contract = new ethers.Contract(
          marketplaceAddress,
          NFTMarketplace.abi,
          signer
        );
        setHasCancelBidRequesting(true);
        let transaction = await contract.withdrawBid(id);
        await transaction.wait();
        const cancelBidRequest = await ApiClient(userAccount).patch(
          `/nft/withdraw-bid`,
          {
            tokenId: id,
          }
        );
        console.log("cancel bid token", cancelBidRequest);
        setHasCancelBidRequesting(false);
        await fetchNFT();
        const successCode = toaster.push(
          <NotificationUI message="Cancel bid successfully" type="success" />,
          { placement: "bottomStart" }
        );
        setTimeout(() => toaster.remove(successCode), 2500);
      } catch (error) {
        setHasCancelBidRequesting(false);
        console.log("Unknown error: ", error);
        const failureCode = toaster.push(
          <NotificationUI message={error.message} type="error" />,
          { placement: "bottomStart" }
        );
        setTimeout(() => toaster.remove(failureCode), 2500);
      }
  }

  const isOwner = useMemo(
    () =>
      userAccount
        ? userAccount?.toString()?.toLowerCase() ===
            nftData?.seller?.toLowerCase() ||
          userAccount?.toString().toLowerCase() ===
            nftData?.owner?.toLowerCase()
        : false,
    [userAccount, nftData]
  );

  if (!nftData.collectionAddress) return <LoadingPage />;

  return (
    <>
      <Modal
        open={openBidModal}
        onClose={handleCloseModal}
        className={styles.customModal}
      >
        <Modal.Header>
          <Modal.Title className="flex justify-center">
            <div className="text-center font-semibold text-xl">Place a bid</div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-lg font-semibold mb-4 mt-4">Price</p>
          <div className="flex mb-4 items-center">
            <div className="bg-blue-50/30 flex gap-2 pr-10 pl-4 py-4 border rounded-l-md">
              <Image
                src="https://openseauserdata.com/files/6f8e2979d428180222796ff4a33ab929.svg"
                alt="eth-icon"
                height={30}
                width={30}
              />
              <p>ETH</p>
            </div>
            <input
              placeholder="Amount"
              className="border rounded p-4 w-full"
              value={placeBidPrice}
              onChange={(e) => {
                setPlaceBidPrice(e.target.value);
                if (!isNumeric(e.target.value)) {
                  setValidateBidError("Invalid amount");
                } else if (
                  parseFloat(e.target.value) <=
                    parseFloat(
                      ethers.utils.formatEther(
                        nftData?.auctionInfo?.highestBid.toString()
                      )
                    ) ||
                  parseFloat(e.target.value) <=
                    parseFloat(
                      ethers.utils.formatEther(
                        nftData?.auctionInfo?.startingPrice.toString()
                      )
                    )
                ) {
                  setValidateBidError("Not enough ETH to place bid");
                } else if (
                  parseFloat(e.target.value) >
                  parseFloat(userBalance ? userBalance.toString() : 0)
                ) {
                  setValidateBidError("Higher than our balance");
                } else {
                  setValidateBidError("");
                }
              }}
            />
          </div>
          <div className="flex justify-between w-full pb-9 border-b">
            <p className="text-sm font-medium text-red-600">
              {validateBidError}
            </p>
            <p className="text-sm">
              Available:{" "}
              {userBalance ? userBalance.toString().substring(0, 6) : 0} ETH
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer className="flex justify-center">
          <button
            className={`text-white transition ease-in ${
              !placeBidPrice || !!validateBidError
                ? "bg-blue-300"
                : "bg-blue-500 hover:bg-blue-800"
            }  focus:ring-2 focus:ring-blue-200 font-semibold rounded-lg text-sm px-8 py-4 mr-2`}
            disabled={!placeBidPrice || !!validateBidError || hasBidRequesting}
            onClick={bid}
          >
            {hasBidRequesting ? <LoadingUI /> : <></>}
            Place bid
          </button>
        </Modal.Footer>
      </Modal>
      <Modal
        open={openBuyModal}
        onClose={handleCloseBuyModal}
        className={styles.customModal}
      >
        <Modal.Header>
          <Modal.Title className="flex justify-center">
            <div className="text-center font-semibold text-xl">
              {hasBuyRequesting === "onSale"
                ? "Complete checkout"
                : hasBuyRequesting === "buying"
                ? "Your purchase is processing..."
                : hasBuyRequesting === "done"
                ? "Your purchase is complete!"
                : "Something went wrong"}
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {hasBuyRequesting === "onSale" ? (
            <>
              {" "}
              <p className="text-lg font-semibold mb-4 mt-4">Item</p>
              <div className="flex justify-between items-center py-8 border-t border-b">
                <div className="flex gap-2 items-center">
                  {image && (
                    <div className="rounded overflow-hidden">
                      <Image
                        width={48}
                        height={48}
                        src={image}
                        alt="nft-image"
                        objectFit="contain"
                      />
                    </div>
                  )}
                  <div>
                    <p className="text-gray-500 text-xs">
                      {isMultiToken === false ? "UITToken721" : "UITToken1155"}
                    </p>
                    <p className="font-semibold text-sm mt-[0px]">{name}</p>
                    <p className="text-gray-500 text-xs mt-[0px]">
                      Quantity: 1
                    </p>
                  </div>
                </div>
                <div className="flex items-end flex-col">
                  <p className="text-gray-500 text-xs">Price</p>
                  <div className="flex gap-1">
                    <Image
                      src="https://openseauserdata.com/files/6f8e2979d428180222796ff4a33ab929.svg"
                      alt="eth-icon"
                      height={14}
                      width={14}
                    />
                    <p className="font-semibold">
                      {convertWeiToEther(nftData.price.toString())}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center mt-8">
                <p className="text-lg font-semibold">Total</p>
                <div className="flex items-end flex-col">
                  <div className="flex gap-1">
                    <Image
                      src="https://openseauserdata.com/files/6f8e2979d428180222796ff4a33ab929.svg"
                      alt="eth-icon"
                      height={14}
                      width={14}
                    />
                    <p className="font-semibold">
                      {convertWeiToEther(nftData.price.toString())}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : hasBuyRequesting === "buying" ? (
            <div className="flex flex-col gap-4 items-center">
              <LoadingUI />
              <p className="text-base text-gray-600 text-center">
                Your purchase of {name} is processing. It should be confirmed on
                the blockchain shortly.
              </p>
            </div>
          ) : hasBuyRequesting === "done" ? (
            <div className="flex flex-col gap-4 items-center">
              {image && (
                <div className="rounded w-[120px] overflow-hidden">
                  <Image
                    width={120}
                    height={120}
                    src={image}
                    alt="nft-image-modal"
                    objectFit="contain"
                  />
                </div>
              )}
              <p className="text-base text-gray-600 text-center">
                You are now the proud owner of {name} from the{" "}
                {isMultiToken ? "UITToken1155" : "UITToken721"} collection.
              </p>
            </div>
          ) : (
            <div className="flex justify-center text-center text-red-500">
              {buyError}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="flex justify-center">
          {hasBuyRequesting === "onSale" ? (
            <button
              className={`text-white transition ease-in ${
                hasBuyRequesting === "buying"
                  ? "bg-blue-300"
                  : "bg-blue-500 hover:bg-blue-800"
              } focus:ring-2 focus:ring-blue-200 font-semibold rounded-lg text-sm px-8 py-4 mr-2`}
              disabled={hasBuyRequesting === "buying"}
              onClick={buyNft}
            >
              {hasBuyRequesting === "buying" ? <LoadingUI /> : <></>}
              Checkout
            </button>
          ) : hasBuyRequesting === "done" ? (
            <div className="flex gap-2 w-full">
              <button
                className={`transition border-2 hover:shadow ease-in bg-white text-blue-500 focus:ring-2 focus:ring-blue-200 font-semibold rounded-lg text-sm px-8 py-4 mr-2 flex-1`}
                onClick={() => router.push(`/sell?id=${id}`)}
              >
                List for sale
              </button>
              <button
                className={`text-white transition ease-in bg-blue-500 hover:bg-blue-800 focus:ring-2 focus:ring-blue-200 font-semibold rounded-lg text-sm px-8 py-4 mr-2 flex-1`}
                disabled={hasBuyRequesting === "buying"}
                onClick={handleCloseBuyModal}
              >
                View item
              </button>
            </div>
          ) : (
            <></>
          )}
        </Modal.Footer>
      </Modal>
      {isOwner ? (
        <div className="fixed bg-blue-50/30 top-[72px] w-full z-50">
          <div className="flex justify-center">
            <div className="w-5/6 flex py-2 justify-end">
              {nftData.sold && nftData.bidded && isOwner ? (
                <button
                  type="button"
                  className="text-white transition ease-in bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-semibold rounded-lg text-sm px-16 py-4 mr-2"
                  onClick={() => {
                    router.push(`/sell?id=${id}`);
                  }}
                >
                  Sell
                </button>
              ) : (
                <></>
              )}
              {!nftData.sold || !nftData.bidded ? (
                <button
                  type="button"
                  className="text-blue-600 border hover:shadow-md hover:border-blue-800 border-blue-500 bg-white hover:text-blue-800 focus:ring-4 focus:ring-blue-300 font-semibold rounded-lg text-sm px-10 py-4 transition ease-in"
                  onClick={cancelListing}
                  disabled={hasCancelListRequesting}
                >
                  {hasCancelListRequesting ? <LoadingUI /> : <></>}
                  Cancel listing
                </button>
              ) : (
                <></>
              )}
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
      <div className="flex justify-center w-full">
        <div className="w-5/6 flex flex-col pt-28">
          <div className="md:flex gap-6">
            <div className="basis-2/5 mb-8">
              <div className="flex flex-col items-center border shadow rounded-xl overflow-hidden w-full mb-4">
                <div className="p-4 w-full">
                  <div className="flex">
                    <Image
                      src="https://openseauserdata.com/files/6f8e2979d428180222796ff4a33ab929.svg"
                      alt="eth-icon"
                      height={20}
                      width={10}
                    />
                  </div>
                </div>
                <img src={image} />
              </div>
              <div className="flex flex-col border shadow rounded-xl overflow-hidden w-full">
                <div className="p-4 w-full flex">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 6h16M4 12h16M4 18h7"
                    />
                  </svg>
                  <p className="text-md font-medium ml-3">Description</p>
                </div>
                <div className="p-4 border-t bg-blue-50/30">
                  <p className="text-sm font-normal">{description}</p>
                </div>
                <div className="p-4 w-full flex justify-between">
                  <div className="flex">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-md font-medium ml-3">Detail</p>
                  </div>
                </div>
                <div className="p-4 border-t /30">
                  <div className="flex justify-between mb-3">
                    <p className="text-sm font-normal">Contract Address</p>
                    <p className="text-sm font-medium text-blue-500 cursor-pointer">
                      <a
                        target="_blank"
                        href={`https://rinkeby.etherscan.io/address/${nftData.nftContract}`}
                        rel="noopener noreferrer"
                      >
                        {getShortAddress(nftData.nftContract, userAccount)}
                      </a>
                    </p>
                  </div>
                  <div className="flex justify-between mb-3">
                    <p className="text-sm font-normal">Token ID</p>
                    <p className="text-sm font-medium text-blue-500">{id}</p>
                  </div>
                  <div className="flex justify-between mb-3">
                    <p className="text-sm font-normal">Token Standard</p>
                    <p className="text-sm font-medium text-gray-500">
                      {isMultiToken == "true" ? "ERC-1155" : "ERC-721"}
                    </p>
                  </div>
                  <div className="flex justify-between mb-3">
                    <p className="text-sm font-normal">Blockchain</p>
                    <p className="text-sm font-medium text-gray-500">Rinkeby</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="basis-3/5">
              <p className="text-3xl font-semibold mb-8">{name}</p>
              <div className="flex gap-1 mb-8">
                <p className="text-sm font-normal text-gray-500 ">Own by </p>
                <p className="text-sm font-normal text-blue-500 cursor-pointer mt-0">
                  <a
                    target="_blank"
                    href={`https://rinkeby.etherscan.io/address/${
                      nftData.bidded && nftData.sold
                        ? nftData.owner
                        : nftData.seller
                    }`}
                    rel="noopener noreferrer"
                  >
                    {nftData.bidded && nftData.sold
                      ? getShortAddress(nftData.owner, userAccount)
                      : getShortAddress(nftData.seller, userAccount)}
                  </a>
                </p>
              </div>
              <div className="rounded-md border mb-4">
                {nftData.bidded ? (
                  <></>
                ) : (
                  <div className="flex p-4 border-b gap-2 align-middle text-gray-500 text-base">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p>
                      Sale ends{" "}
                      {nftData.auctionInfo.endAt
                        ? new Date(
                            nftData.auctionInfo.endAt
                          ).toLocaleDateString("en-US", dateOptions)
                        : ""}
                    </p>
                  </div>
                )}
                {nftData.bidded && nftData.sold ? (
                  <></>
                ) : (
                  <div className="bg-blue-50/30 flex flex-col gap-3 p-4">
                    <p className=" text-gray-500">
                      {!nftData.bidded ? "Minimum bid" : "Current price"}
                    </p>
                    <div className="flex gap-3">
                      <Image
                        src="https://openseauserdata.com/files/6f8e2979d428180222796ff4a33ab929.svg"
                        alt="eth-icon"
                        height={15}
                        width={15}
                      />
                      <p className="font-semibold text-3xl">
                        {!nftData.bidded
                          ? parseFloat(
                              nftData.auctionInfo.highestBid.toString()
                            ) > 0
                            ? convertWeiToEther(
                                nftData.auctionInfo.highestBid.toString()
                              )
                            : convertWeiToEther(
                                nftData.auctionInfo.startingPrice.toString()
                              )
                          : !nftData.sold
                          ? convertWeiToEther(nftData.price.toString())
                          : ""}
                      </p>
                    </div>
                    <button
                      title={isOwner ? "You own this item" : ""}
                      type="button"
                      className={`${
                        isOwner
                          ? "bg-blue-200 cursor-not-allowed"
                          : "bg-blue-700 hover:bg-blue-800"
                      } text-white flex justify-center items-center gap-2 w-3/5  focus:ring-4 focus:ring-blue-300 font-bold rounded-lg text-sm px-16 py-4 mr-2`}
                      onClick={
                        !nftData.bidded
                          ? () => {
                              handleOpenModal();
                            }
                          : () => {
                              handleOpenBuyModal();
                            }
                      }
                      disabled={isOwner}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                      {!nftData.bidded ? "Place bid" : "Buy now"}
                    </button>
                  </div>
                )}
              </div>
              {nftData.bidded ? (
                <></>
              ) : (
                <div className="rounded-md border">
                  <div className="p-4 flex gap-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 6h16M4 10h16M4 14h16M4 18h16"
                      />
                    </svg>
                    <p className="font-semibold">Offers</p>
                  </div>
                  <table className="table-auto w-full border-t">
                    <thead>
                      <tr>
                        <th className="text-left font-normal p-4">Price</th>
                        <th className="text-left font-normal p-4">From</th>
                        <th className="text-left font-normal p-4"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-blue-50/30">
                      {parseFloat(nftData?.auctionInfo?.highestBid.toString()) >
                      0 ? (
                        (nftData?.auctionInfo?.bids.length > 0
                          ? [
                              ...nftData?.auctionInfo?.bids,
                              {
                                bid: nftData?.auctionInfo?.highestBid,
                                bidder: nftData?.auctionInfo?.highestBidder,
                                bidTime: nftData?.auctionInfo?.highestBidTime,
                              },
                            ]
                          : [
                              {
                                bid: nftData?.auctionInfo?.highestBid,
                                bidder: nftData?.auctionInfo?.highestBidder,
                                bidTime: nftData?.auctionInfo?.highestBidTime,
                              },
                            ]
                        )
                          .reverse()
                          ?.filter(
                            (item) => parseFloat(item?.bid.toString()) > 0
                          )
                          .map((bidItem, index) => (
                            <tr key={bidItem.toString()} className="py-2">
                              <td className="flex gap-2 font-semibold p-4">
                                <Image
                                  src="https://openseauserdata.com/files/6f8e2979d428180222796ff4a33ab929.svg"
                                  alt="eth-icon"
                                  height={10}
                                  width={10}
                                />
                                {convertWeiToEther(bidItem?.bid.toString())}
                              </td>
                              <td className="p-4">
                                {getShortAddress(bidItem?.bidder, userAccount)}
                              </td>
                              <td>
                                {index === 0 ? (
                                  <p>Highest bid</p>
                                ) : !userAccount ? (
                                  <></>
                                ) : bidItem?.bidder.toLowerCase() ===
                                  userAccount.toLowerCase() ? (
                                  <button
                                    onClick={cancelBid}
                                    className="py-2 px-4 border text-sm border-blue-500 bg-white text-blue-600 rounded-md"
                                    disabled={hasCancelBidRequesting}
                                  >
                                    {hasCancelBidRequesting ? (
                                      <LoadingUI />
                                    ) : (
                                      <></>
                                    )}
                                    Cancel
                                  </button>
                                ) : (
                                  <></>
                                )}
                              </td>
                            </tr>
                          ))
                      ) : (
                        <tr className="w-full flex flex-col justify-center items-center p-4">
                          <img
                            src="https://testnets.opensea.io/static/images/empty-bids.svg"
                            alt="no-bid"
                            width={80}
                          />
                          <p className="mt-4">No offer yet</p>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default NFTDetail;
