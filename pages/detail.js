import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Image from "next/image";
import Router from "next/router";

function NFTDetail() {
  const router = useRouter();
  const { id, tokenURI, isMultiToken } = router.query;
  const [formInput, updateFormInput] = useState({ price: "", image: "" });
  const { image, price, name, description } = formInput;

  useEffect(() => {
    fetchNFT();
  }, [id]);

  async function fetchNFT() {
    if (!tokenURI) return;
    const meta = await axios.get(tokenURI);
    updateFormInput((state) => ({
      ...state,
      image: meta.data.image,
      name: meta.data.name,
      description: meta.data.description,
    }));
  }
  return (
    <>
      <div className="fixed bg-blue-50 top-23 w-full z-50">
        <div className="flex justify-center">
          <div className="w-3/4 flex py-2 justify-end">
            <button
              type="button"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-16 py-4 mr-2"
              onClick={() => {
                Router.push(
                  `/sell?id=${id}&tokenURI=${tokenURI}&isMultiToken=${isMultiToken}`
                );
              }}
            >
              Sell
            </button>
          </div>
        </div>
      </div>
      <div className="flex justify-center w-full">
        <div className="w-5/6 flex flex-col pt-28">
          <div className="flex gap-6">
            <div className="basis-2/5">
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
                <div className="p-4 border-t bg-blue-50">
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
                <div className="p-4 border-t bg-blue-50">
                  <div className="flex justify-between mb-3">
                    <p className="text-sm font-normal">Contract Address</p>
                    <p className="text-sm font-medium">Contract</p>
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
              <p className="text-3xl font-semibold mb-4">{name}</p>
              <p className="text-sm font-medium mb-4 text-gray-500">Own by</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default NFTDetail;
