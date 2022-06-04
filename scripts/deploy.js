const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const Erc721 = await hre.ethers.getContractFactory("UITToken721");
  const erc721 = await Erc721.deploy();
  await erc721.deployed();
  const Erc1155 = await hre.ethers.getContractFactory("UITToken1155");
  const erc1155 = await Erc1155.deploy();
  await erc1155.deployed();
  const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
  const nftMarketplace = await NFTMarketplace.deploy(
    erc1155.address,
    erc721.address
  );
  await nftMarketplace.deployed();
  console.log("ERC721:", erc721.address);
  console.log("ERC1155:", erc1155.address);
  console.log("Contract deployed to:", nftMarketplace.address);

  fs.writeFileSync(
    "./config.js",
    `
  export const marketplaceAddress = "${nftMarketplace.address}";
  export const erc721Address = "${erc721.address}";
  export const erc1155Address = "${erc1155.address}";
  `
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
