// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import "./UITToken1155.sol";
import "./UITToken721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

contract NFTMarketplace is ReentrancyGuard, ERC1155Holder, ERC721Holder {
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;
  address owner;
  UITToken1155 _multiToken;
  UITToken721 _nftToken;
  struct Bid {
    address bidder;
    uint256 bid;
    uint256 bidTime;
  }
  struct AuctionInfo {
    uint256 startAt;
    uint256 endAt;
    address highestBidder;
    uint256 highestBid;
    uint256 highestBidTime;
    uint256 startingPrice;
    Bid[] bids;
  }
  struct MarketItem {
    uint256 tokenId;
    address nftContract;
    address payable seller;
    address payable owner;
    uint256 price;
    bool sold;
    bool bidded;
    bool isMultiToken;
    AuctionInfo auctionInfo;
  }
  mapping(uint256 => MarketItem) private idMarketItemMapping;
  
  event MarketItemCreated(uint256 indexed tokenId, address indexed nftContract, address owner, bool isMultiToken);
  event MarketItemListed(uint256 indexed tokenId, address indexed nftContract, address owner, bool isMultiToken, uint256 price);
  event MarketItemCancelListed(uint256 indexed tokenId, address indexed nftContract, address owner, bool isMultiToken, uint256 price);
  event MarketItemAuctionListed(uint256 indexed tokenId, address indexed nftContract, address seller, bool isMultiToken, uint256 startingPrice, uint256 startTime, uint256 endTime);
  event MarketItemAuctionEnded(uint256 indexed tokenId, address indexed nftContract, address seller, bool isMultiToken, address highestBidder, uint256 highestBid, uint256 endTime);
  event MarketItemSold(uint256 indexed tokenId, address indexed nftContract, address seller, address buyer, uint256 price);
  event MarketItemBidded(uint256 indexed tokenId, address indexed nftContract, address seller, address bidder, uint256 bid, uint256 bidTime);
  event BidderWithdraw(uint256 indexed tokenId, address indexed nftContract, address seller, address bidder, uint256 balance);

  constructor(address _mToken, address _nToken) {
    _multiToken = UITToken1155(_mToken);
    _nftToken = UITToken721(_nToken);
    _multiToken.setParentAddress(address(this));
    _nftToken.setParentAddress(address(this));
    owner = payable(msg.sender);
  }

  uint256 private MINIMUM_AUCTION_TIME = 1800; // 30 Minutes
  uint256 private listingPrice = 0.025 ether;

  /* Updates the listing price of the contract */
  function updateListingPrice(uint _listingPrice) external payable {
    require(owner == msg.sender, "Only marketplace owner can update listing price.");
    listingPrice = _listingPrice;
  }

  /* Returns the listing price of the contract */
  function getListingPrice() external view returns (uint256) {
    return listingPrice;
  }

  function createMarketItem(address nftContract, string memory tokenUri, bool isMultiToken) external payable returns (uint256){
    _tokenIds.increment();
    uint256 tokenId = _tokenIds.current();
    if (isMultiToken) {
      createNFT1155(tokenId, 1, tokenUri); // Amount set to 1 as NFT
    } else {
      createNFT721(tokenId, tokenUri, "UITToken", "UIT");
    }
    MarketItem storage item = idMarketItemMapping[tokenId];
    item.tokenId = tokenId;
    item.nftContract = nftContract;
    item.seller = payable(address(0));
    item.owner = payable(msg.sender);
    item.sold = true;
    item.bidded = true;
    item.isMultiToken = isMultiToken;
    idMarketItemMapping[tokenId] = item;
    emit MarketItemCreated(tokenId, nftContract, item.owner, isMultiToken);
    return tokenId;
  }

  function listAuctionItem(uint256 tokenId, uint256 startTime, uint256 endTime, uint256 startingPrice) external payable returns (uint256){
    require(msg.value >= listingPrice, "Price must be equal or higher than listing price");
    MarketItem storage item = idMarketItemMapping[tokenId];
    require(startingPrice > 0, "Starting price must be larger than 0");
    require(msg.sender == item.owner, "Only owner can auction");
    require(item.sold && item.bidded, "NFT is on sale");
    require(block.timestamp < endTime, "Ended!");
    require(endTime - startTime > MINIMUM_AUCTION_TIME, "The auction time must be longer than 30 minutes!");
    item.auctionInfo.startAt = startTime;
    item.auctionInfo.endAt = endTime;
    item.auctionInfo.highestBid = 0;
    item.auctionInfo.highestBidder = address(0);
    item.auctionInfo.highestBidTime = 0;
    item.auctionInfo.startingPrice = startingPrice;
    delete item.auctionInfo.bids;
    item.bidded = false;
    item.seller = payable(msg.sender);
    item.owner = payable(address(this));
    idMarketItemMapping[tokenId] = item;
    transferFrom(msg.sender, address(this), tokenId, item.nftContract, item.isMultiToken);
    emit MarketItemAuctionListed(tokenId, item.nftContract, item.seller, item.isMultiToken, startingPrice, startTime, endTime);
    return tokenId;
  }

  function listMarketItem(uint256 tokenId, uint256 price) external payable returns (uint256) {
    require(msg.value >= listingPrice, "Price must be equal or higher than listing price");
    require(price > 0, "Price must be at least 1 wei");
    MarketItem storage item = idMarketItemMapping[tokenId];
    require(item.owner == msg.sender, "Only owner can list item!");
    item.price = price;
    item.sold = false;
    item.seller = payable(msg.sender);
    item.owner = payable(address(this));
    idMarketItemMapping[tokenId] = item;
    transferFrom(msg.sender, address(this), tokenId, item.nftContract, item.isMultiToken);
    emit MarketItemListed(tokenId, item.nftContract, item.owner, item.isMultiToken, price);
    return tokenId;
  }

  function bid(uint256 tokenId) external payable {
    MarketItem storage item = idMarketItemMapping[tokenId];
    require(item.seller != msg.sender, "You can't bid your item");
    require(item.bidded == false, "Item isn't bidding");
    require(block.timestamp > item.auctionInfo.startAt && block.timestamp < item.auctionInfo.endAt, "Not in bid period!");
    require(msg.value > item.auctionInfo.highestBid, "Must bid higher the highest bid!");
    if (item.auctionInfo.highestBidder != address(0)) {
      Bid memory bidItem = Bid({bidder: item.auctionInfo.highestBidder, bid: item.auctionInfo.highestBid, bidTime: item.auctionInfo.highestBidTime});
      item.auctionInfo.bids.push(bidItem);
    }
    item.auctionInfo.highestBid = msg.value;
    item.auctionInfo.highestBidder = msg.sender;
    item.auctionInfo.highestBidTime = block.timestamp;
    idMarketItemMapping[tokenId] = item;
    emit MarketItemBidded(tokenId, item.nftContract, item.seller, msg.sender, msg.value, block.timestamp);
  }

  function withdrawBid(uint256 tokenId) external payable nonReentrant {
    MarketItem storage item = idMarketItemMapping[tokenId];
    uint256 balance = 0;
    for (uint i = 0; i < item.auctionInfo.bids.length; i++) {
      if (item.auctionInfo.bids[i].bidder == msg.sender) {
        balance += item.auctionInfo.bids[i].bid;
        item.auctionInfo.bids[i].bid = 0;
      }
    }
    require(balance > 0, "You haven't bidded yet!");
    payable(msg.sender).transfer(balance);
    idMarketItemMapping[tokenId] = item;
    emit BidderWithdraw(tokenId, item.nftContract, item.seller, msg.sender, balance);
  }

  function endAuction(uint256 tokenId) external payable nonReentrant {
    MarketItem storage item = idMarketItemMapping[tokenId];
    require(block.timestamp >= item.auctionInfo.endAt, "Auction is still ongoing!");
    require(!item.bidded, "Auction already ended!");
    address seller = item.seller;
    if (item.auctionInfo.highestBidder != address(0)) { // Transfer token to winner
        for (uint i = 0; i < item.auctionInfo.bids.length; i++) {
          if (item.auctionInfo.bids[i].bid > 0) {
            payable(item.auctionInfo.bids[i].bidder).transfer(item.auctionInfo.bids[i].bid);
          }
        }
        payable(item.seller).transfer(item.auctionInfo.highestBid);
        item.owner = payable(item.auctionInfo.highestBidder);
        transferFrom(address(this), item.auctionInfo.highestBidder, tokenId, item.nftContract, item.isMultiToken);
    } else { // Transfer token to seller
        transferFrom(address(this), item.seller, tokenId, item.nftContract, item.isMultiToken);
        item.owner = payable(seller);
    }
    item.seller = payable(address(0));
    item.bidded = true;
    idMarketItemMapping[tokenId] = item;
    emit MarketItemAuctionEnded(tokenId, item.nftContract, seller, item.isMultiToken, item.auctionInfo.highestBidder, item.auctionInfo.highestBid, block.timestamp);
  }
  
  function createMarketSale(uint256 tokenId) external payable nonReentrant {
    MarketItem storage item = idMarketItemMapping[tokenId];
    address payable seller = item.seller;
    require(item.sold == false, "Item isn't on sale");
    require(msg.value == item.price, "Buyer must trasfer Ether equal Price of Item");
    payable(item.seller).transfer(msg.value);
    item.owner = payable(msg.sender);
    item.seller = payable(address(0));
    item.sold = true;
    idMarketItemMapping[tokenId] = item;
    transferFrom(address(this), msg.sender, tokenId, item.nftContract, item.isMultiToken);
    emit MarketItemSold(tokenId, item.nftContract, seller, msg.sender, item.price);
  }

  function cancelListingItem(uint256 tokenId) external payable {
    MarketItem storage item = idMarketItemMapping[tokenId];
    require(msg.sender == item.seller, "Only seller can cancel listing!");
    require(item.sold == false || item.bidded == false, "Only listed item can cancel listing!");
    item.sold = true;
    item.bidded = true;
    item.owner = payable(msg.sender);
    item.seller = payable(address(0));
    idMarketItemMapping[tokenId] = item;
    transferFrom(address(this), msg.sender, tokenId, item.nftContract, item.isMultiToken);
    emit MarketItemCancelListed(tokenId, item.nftContract, item.owner, item.isMultiToken, item.price);
  }

  function fetchMarketItem(uint256 _id) external view returns(MarketItem memory){
    return idMarketItemMapping[_id];
  }

  function fetchAllNFTs(uint256 cursor, uint256 howMany) external view returns (MarketItem[] memory items, uint256 newCursor) {
    uint totalItemCount = _tokenIds.current();
    uint256 length = howMany;
    if (length > totalItemCount - cursor) {
      length = totalItemCount - cursor;
    }

    MarketItem[] memory _items = new MarketItem[](length);
    for (uint i = cursor; i < length; i++) {
      MarketItem storage currentItem = idMarketItemMapping[i+1];
      _items[i] = currentItem;
    }
    return (_items, cursor + length);
  }

  /**ERC1155 functionality ***********************************************/
  function get1155TokenURI(uint256 _tokenId) public view returns(string memory){
    return _multiToken.getTokenURI(_tokenId);
  }
  function createNFT1155(uint256 _tokenId, uint256 _amount, string memory _tokenUri) private {
    _multiToken.mintNFT(msg.sender, _tokenId, _amount, _tokenUri);
  }

  /**ERC721 functionality *************************************************/
  function createNFT721(uint256 _tokenId, string memory uri, string memory name, string memory symbol) private {
    _nftToken.mintNFT(msg.sender, _tokenId, uri, name, symbol);
  }

  function get721TokenURI(uint256 _tokenId) public view returns(string memory) {
    return _nftToken.getTokenUri(_tokenId);
  }

  function transferFrom(address _owner, address _receiver, uint _tokenId, address _nftContract, bool isMultiToken) private {
    if (isMultiToken) {
      IERC1155(_nftContract).safeTransferFrom(_owner, _receiver, _tokenId, 1, '[]');
    } else {
      IERC721(_nftContract).transferFrom(_owner, _receiver, _tokenId);
    }
  }
}