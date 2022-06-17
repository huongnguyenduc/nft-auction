import { create as ipfsHttpClient } from "ipfs-http-client";
const cloudinaryApiLink = process.env.NEXT_PUBLIC_CLOUDINARY_API_URL;
const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

export async function uploadFileToIPFS(file) {
  const added = await client.add(file);
  const url = `https://ipfs.infura.io/ipfs/${added.path}`;
  return url;
}

export function uploadFileToCloudinary(file) {
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", "nft_auction");
  data.append("folder", "nft");
  var url = cloudinaryApiLink;
  var option = {
    method: "POST",
    body: data,
  };
  return fetch(url, option).then((res) => res.json());
}
