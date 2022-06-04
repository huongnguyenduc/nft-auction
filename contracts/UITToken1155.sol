// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Receiver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract UITToken1155 is ERC1155, Ownable {
    address parentAddress;

    uint256[] tokensIdscreated;

    //to track supply of each token via id => total
    mapping(uint256 => uint256) private _totalSupply;

    mapping (uint256 => string) private _tokenURIString;
    
    constructor() ERC1155("") {}
    
    
    function setParentAddress(address _address) public {
        parentAddress = _address;
    }

    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }

    function getURI(uint256 _tokenId) private view returns(string memory){
        return uri(_tokenId);
    }

    function uri(uint256 _tokenId) override public view returns (string memory) {
        return(_tokenURIString[_tokenId]);
    }

    function getTokenURI(uint256 _tokenId) public view returns(string memory) {
        return _tokenURIString[_tokenId];
    }

    function setParentApproval() public {
        //apprvove parent contract to handle tokens and transactions.
        setApprovalForAll(parentAddress, true);
    }

    function mintNFT(address _owner, uint256 _id, uint256 amount, string memory _tokenUri ) public {
       // using erc 1155 to creat NFT
       // mint will create NFT and send it to the address. IF address is parent contract then it will throw error unless IERC1155Receiver.onERC1155BatchReceived is implemented. 

       _mint(_owner, _id, amount, ""); 
       tokensIdscreated.push(_id);

       _totalSupply[_id] = amount;

       _tokenURIString[_id] = _tokenUri; 

    }
    
    //get tokens totalnumber. 
    function getTokenCount() public view returns (uint256) {
        return tokensIdscreated.length;
    }
    //returns the array of all tokenids. 
    function getTokenIds() public  view returns ( uint256[] memory) {
        return tokensIdscreated;
    }

    function getTotalSupplyOfToken(uint256 _id) public view returns(uint256) {
        return _totalSupply[_id];
    }
    
    // function onERC1155Received( address operator, address from,uint256 id, uint256 value, bytes calldata data) override pure external returns (bytes4){
    //     // TransferSingle.emit(operator, from, , id, value);
    //     return bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"));
    // }
    
    // function onERC1155BatchReceived( address operator, address from, uint256[] calldata ids, uint256[] calldata values, bytes calldata data ) override pure external returns (bytes4){
    //     return bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"));
    // }

}