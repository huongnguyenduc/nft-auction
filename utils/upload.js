import { create as ipfsHttpClient } from "ipfs-http-client";
const cloudinaryApiLink = process.env.NEXT_PUBLIC_CLOUDINARY_API_URL;
// const projectId = process.env.NEXT_PUBLIC_IPFS_PROJECT_ID;
// const projectSecret = process.env.NEXT_PUBLIC_IPFS_PROJECT_SECRET;
// const authorization = () =>
//   "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");
const client = ipfsHttpClient("http://ipfs.infura.io:5001/api/v0");

export async function uploadFileToIPFS(file) {
  // {
  // url:
  //   ,
  //   headers: { authorization: authorization() },
  // }
  const added = await client.add(file, {
    progress: (prog) => console.log(`received: ${prog}`),
  });
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
