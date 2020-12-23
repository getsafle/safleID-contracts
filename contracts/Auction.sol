pragma solidity 0.5.0;

import "./checkingContract.sol";

interface RegistrarStorage {
    function resolveInbloxId(string calldata) external view returns(address);
    function transferInbloxId (string calldata , address , address ) external returns (bool);
    function auctionInProcess (address, string calldata) external returns (bool);
}

contract Auction is checkingContract {

    uint8 constant MAX_NAME_LENGTH = 16;

    // State variables to manage contract addresses
    address public contractOwner;
    RegistrarStorage public storageContract;

    // State variables to for auction details
    mapping (address => auctionData ) public auction;
    mapping (address => bool) public alreadyActiveAuction;
    mapping (string => address) inbloxIdToAddress;

    // Struct to store the Auction data
    struct auctionData {
        bool isAuctionLive;
        address payable auctionConductor;
        string inbloxId;
        mapping (address => uint256) bidRate;
        mapping (address => uint256) highestBidder;
        address payable higestBidderAddress;
        uint256 highestBid;
        uint256 totalBids;
        uint256 totalBidders;
        address payable[] biddersArray;
        bool returnBidsOfOther;
        uint256 auctionLastFor;
        bool inbloxIdTransferred;
    }

    // Address of the Registrar Storage Contrat to be passed in the constructor
    constructor (RegistrarStorage _storageContract) public {
        contractOwner = msg.sender;
        storageContract = _storageContract;
    }
    
    /**
    * @dev Modifier to ensure that the auction data entered is valid
    * @param _inbloxId inbloxId of the user to be auctioned
    * @param _auctionSeconds time limit for the auction in seconds
    */
    modifier validateAuctionData (string memory _inbloxId, uint256 _auctionSeconds) {
        
        require(checkLength(_inbloxId) <= MAX_NAME_LENGTH, "Length of the inbloxId should be betweeb 4-16 characters.");
        require(_auctionSeconds > 300 && _auctionSeconds < 7776000, "Auction time should be in between 330 to 7776000 seconds.");
        require(alreadyActiveAuction[msg.sender]==false, "Auction is already in process by this user.");
        require (storageContract.resolveInbloxId( _inbloxId) == msg.sender, "You are not an owner of this InbloxId.");
        _;

    }

    /**
    * @dev Auction the user's inbloxId
    * @param _inbloxId inbloxId of the user
    * @param _auctionSeconds time period for auction in seconds
    */
    function auctionInbloxId(string calldata _inbloxId, uint256 _auctionSeconds) validateAuctionData(_inbloxId, _auctionSeconds) external returns (bool) {

        string memory lower = toLower(_inbloxId);
        auction[msg.sender].isAuctionLive = true;
        auction[msg.sender].auctionConductor = msg.sender;
        auction[msg.sender].inbloxId = lower;
        auction[msg.sender].auctionLastFor = now+_auctionSeconds;
        inbloxIdToAddress[lower] = msg.sender;
        alreadyActiveAuction[msg.sender] = true;
        storageContract.auctionInProcess(msg.sender, lower);
    }

    /**
    * @dev Bid for a inbloxId in an ongoing auction
    * This method is payable.
    * @param _inbloxId inbloxId of a user
    */
    function bidForInbloxId(string calldata _inbloxId) external payable returns (bool) {

        string memory lower = toLower(_inbloxId);
        uint256 bidAmount = msg.value;

        require(inbloxIdToAddress[lower] != address(0x0));
        require(!isContract(msg.sender));
        

        address auctioner = inbloxIdToAddress[lower];

        require(auction[auctioner].isAuctionLive,"Auction is not live");
        require(auction[auctioner].auctionConductor != msg.sender,"you cannot bid for your InbloxId");
        require(bidAmount + auction[auctioner].bidRate[msg.sender]> auction[auctioner].highestBid, "bid amount should be higher then previous bid" );
        require(now < auction[auctioner].auctionLastFor, "Auction time is completed");

        auction[auctioner].bidRate[msg.sender] = auction[auctioner].bidRate[msg.sender]+bidAmount;
        auction[auctioner].highestBidder[msg.sender] = auction[auctioner].bidRate[msg.sender];
        auction[auctioner].higestBidderAddress = msg.sender;

        if(auction[auctioner].bidRate[msg.sender]==0){

         auction[auctioner].highestBid = bidAmount;
         auction[auctioner].biddersArray.push(msg.sender);
         auction[auctioner].totalBidders++;

        } else {
         auction[auctioner].highestBid = auction[auctioner].bidRate[msg.sender];
        }

        auction[auctioner].totalBids++;

    }
    
    /**
    * @dev Return the bids of other bidders except the winner
    */
     function refundOtherBidders() external returns (bool) {
        
        require(auction[msg.sender].returnBidsOfOther ==  false);
        require(auction[msg.sender].auctionConductor == msg.sender);
        require(auction[msg.sender].biddersArray.length > 0);

        for (uint i = 0; i < auction[msg.sender].biddersArray.length; i++){

            uint256 bidderAmount = auction[msg.sender].bidRate[auction[msg.sender].biddersArray[i]];
            auction[msg.sender].biddersArray[i].transfer(bidderAmount);
            alreadyActiveAuction[msg.sender] = false;

        }

        auction[msg.sender].returnBidsOfOther = true;
        transferInbloxIdToWinner();
    }

    /**
    * @dev Transfer the inbloxId to the winner of the Auction
    * This method can only be called internally
    */
    function transferInbloxIdToWinner() internal returns (bool){

        auction[msg.sender].auctionConductor.transfer(auction[msg.sender].highestBid);
        auction[msg.sender].inbloxIdTransferred = true;
        require(storageContract.transferInbloxId(auction[msg.sender].inbloxId, auction[msg.sender].auctionConductor,auction[msg.sender].higestBidderAddress), "Storage contract error.");

    }

    /**
    * @dev Transfer the inbloxId to another user
    * @param _inbloxId inbloxId of the user to be transferred
    * @param _newOwner address of the new owner
    * @return true
    */
    function directlyTransferInbloxId(string calldata _inbloxId, address _newOwner) external returns (bool){

        require (storageContract.resolveInbloxId( _inbloxId) == msg.sender, "You are not an owner of this InbloxId.");
        require(storageContract.transferInbloxId(_inbloxId, msg.sender,_newOwner),"storage contract fails");
        return true;
    }

    /**
    * @dev Get the list of all bidders for an auction
    * @param _auctioner address of a auctioner
    * @return array of bidders
    */
    function arrayOfbidders (address _auctioner) external view returns (address payable[] memory){
        require(auction[_auctioner].auctionConductor != address(0x0));
        return auction[_auctioner].biddersArray;
    }

    /**
    * @dev Get the bid of a particular bidder for an auction
    * @param _auctioner address of a auctioner
    * @param _bidder address of a bidder
    * @return bid of that particular bidder
    */
    function getBidRate (address _auctioner, address _bidder) external view returns (uint256) {
        require(auction[_auctioner].auctionConductor != address(0x0));
        return auction[_auctioner].bidRate[_bidder];
    }

}
