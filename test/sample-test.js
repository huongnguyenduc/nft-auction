/* test/sample-test.js */
describe("NFTMarketplace", function () {
  it("Should create and execute market sales", async function () {
    /* deploy the marketplace */
    const NFTMarketplace = await hre.ethers.getContractFactory(
      "NFTMarketplace"
    );
    const nftMarketplace = await NFTMarketplace.deploy();
    await nftMarketplace.deployed();
    const Erc721 = await hre.ethers.getContractFactory("UITToken721");
    const erc721 = await Erc721.deploy(
      "UITToken721",
      "U721",
      nftMarketplace.address
    );
    await erc721.deployed();
    const Erc1155 = await hre.ethers.getContractFactory("UITToken1155");
    const erc1155 = await Erc1155.deploy(
      "UITToken1155",
      "U1155",
      nftMarketplace.address
    );
    await erc1155.deployed();
    console.log("ERC721:", erc721.address);
    console.log("ERC1155:", erc1155.address);
    console.log("Contract deployed to:", nftMarketplace.address);

    const listingPrice = ethers.utils.parseUnits("0.025", "ether");
    const auctionPrice = ethers.utils.parseUnits("0.01", "ether");
    const auctionPrice1 = ethers.utils.parseUnits("1.2", "ether");
    const auctionPrice2 = ethers.utils.parseUnits("1.4", "ether");

    /* create two tokens */

    const [_, buyerAddress] = await ethers.getSigners();

    /* execute sale of token to another user */
    await nftMarketplace.on("MarketItemCreated", function (result) {
      console.log("event", result);
    });
    await nftMarketplace
      .connect(buyerAddress)
      .createMarketItem(
        erc721.address,
        "https://www.mytokenlocation.com",
        false
      );
    // .then((result) => console.log("result", result));
    await erc721.connect(buyerAddress).setParentApproval();
    await nftMarketplace
      .connect(buyerAddress)
      .listAuctionItem(1, 1654211307, 1754513407, auctionPrice, {
        value: listingPrice,
      });
    await nftMarketplace.connect(_).bid(1, {
      value: auctionPrice1,
    });
    await nftMarketplace.connect(_).bid(1, {
      value: auctionPrice2,
    });
    items = await nftMarketplace.fetchMarketItem(1);
    await nftMarketplace.connect(_).withdrawBid(1);
    items = await nftMarketplace.fetchMarketItem(1);
  });
});
