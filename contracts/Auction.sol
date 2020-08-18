pragma solidity 0.5.0;


import "./checkingContract.sol";

interface RegistrarStorage {

    function isHandleNameTakenByAddress(string calldata, address) external view returns(bool);
    function transferhandleName (string calldata , address , address ) external returns (bool);
    function auctionInProcess (address, string calldata) external returns (bool);
}


contract Auction is checkingContract {

    // Auction variable declaration

    uint8 constant MAX_REGISTRAR_NAME_LENGTH = 16;
    address public contractOwner;
    RegistrarStorage public registrarStorageContractAddress;
    mapping (address => auctionData ) public auction;
    mapping (address => bool) public alreadyActiveAuction; 
    mapping (string => address) handleNameToAddress;

    constructor (RegistrarStorage _storageContract) public {

        contractOwner = msg.sender ;
        registrarStorageContractAddress = _storageContract;

    }
    
    struct auctionData {

        bool isAuctionLive;
        address payable auctionConductor;
        string handleName;
        mapping (address => uint256) bidRate;
        mapping (address => uint256) highestBidder;
        address payable higestBidderAddress;
        uint256 highestBid;
        uint256 totalBids;
        uint256 totalBidders;
        address payable [] biddersArray;
        bool returnBidsOfOther;
        uint256 auctionLastFor;
        bool handleNameTransferred;


    }
    
    modifier validateAuctionData (address auctioner,string memory _handleName, uint256 _auctionSeconds) {
        
        require(checkLength(_handleName) <= MAX_REGISTRAR_NAME_LENGTH,"length of a name is higher");
        require(_auctionSeconds > 300 && _auctionSeconds < 7776000,"Auction time should be in between 330 to 7776000 seconds");
        require(alreadyActiveAuction[msg.sender]==false,"Auction is already in process by this user");
        require (registrarStorageContractAddress.isHandleNameTakenByAddress( _handleName, msg.sender) == true,"you are not an owner of this handle name");
        _;

    }


    /**
    * @dev  to auction your handle name
    * @param _handleName string of a user handle name
    * @param _auctionSeconds time period for auction
    */
    function auctionHandlename(string calldata _handleName, uint256 _auctionSeconds) validateAuctionData(msg.sender, _handleName, _auctionSeconds) external returns (bool) {

        string memory VNinLowerCase = toLower(_handleName);
        auction[msg.sender].isAuctionLive = true;
        auction[msg.sender].auctionConductor = msg.sender;
        auction[msg.sender].handleName = VNinLowerCase;
        auction[msg.sender].auctionLastFor = now+_auctionSeconds;
        handleNameToAddress[VNinLowerCase] = msg.sender;
        alreadyActiveAuction[msg.sender] = true;
        registrarStorageContractAddress.auctionInProcess(msg.sender,VNinLowerCase);

    }

    /**
    * @dev  to bid on a ongoing auction
    * @param _handleName string of a user handle name
    */
    function bidForHandleName(string calldata _handleName) external payable returns (bool) {

        string memory VNinLowerCase = toLower(_handleName);
        uint256 bidAmount = msg.value;

        require(handleNameToAddress[VNinLowerCase] != address(0x0));
        require(!isContract(msg.sender));
        

        address auctioner = handleNameToAddress[VNinLowerCase];

        require(auction[auctioner].isAuctionLive,"Auction is not live");
        require(auction[auctioner].auctionConductor != msg.sender,"you cannot bid for your handle name");
        require(bidAmount + auction[auctioner].bidRate[msg.sender]> auction[auctioner].highestBid,"bid amount should be higher then previous bid" );
        require(now < auction[auctioner].auctionLastFor,"Auction time is completed");

         if(auction[auctioner].bidRate[msg.sender]==0){

         auction[auctioner].bidRate[msg.sender] = bidAmount;
         auction[auctioner].highestBidder[msg.sender] = auction[auctioner].bidRate[msg.sender];
         auction[auctioner].highestBid = bidAmount;
         auction[auctioner].higestBidderAddress = msg.sender;
         
         auction[auctioner].biddersArray.push(msg.sender);
         auction[auctioner].totalBidders++;

         }else {
             
         auction[auctioner].bidRate[msg.sender] = auction[auctioner].bidRate[msg.sender]+bidAmount;
         auction[auctioner].highestBidder[msg.sender] = auction[auctioner].bidRate[msg.sender];
         auction[auctioner].highestBid = auction[auctioner].bidRate[msg.sender];
         auction[auctioner].higestBidderAddress = msg.sender;

         }

         auction[auctioner].totalBids++;

    }
    
    /**
    * @dev  to return bids on a auction that is completed
    */
     function refundOtherBidders() external returns (bool){
        
        require(auction[msg.sender].returnBidsOfOther ==  false);
        require(auction[msg.sender].auctionConductor == msg.sender);
        require(auction[msg.sender].biddersArray.length > 0); //check if any bid is placed of not

        for (uint i = 0; i < auction[msg.sender].biddersArray.length; i++){
            
            
            if(auction[msg.sender].biddersArray[i] != auction[msg.sender].higestBidderAddress)
            {

            uint256 bidderAmount = auction[msg.sender].bidRate[auction[msg.sender].biddersArray[i]];
            auction[msg.sender].biddersArray[i].transfer(bidderAmount);
            alreadyActiveAuction[msg.sender] = false;

            }else if(auction[msg.sender].biddersArray[i] != auction[msg.sender].higestBidderAddress)
            {
                alreadyActiveAuction[msg.sender] = false;
            }
            
        }
        
        auction[msg.sender].returnBidsOfOther =  true;
        transferHandleNameToWinner();

     }

    /**
    * @dev  to transfer handle name and get highest bid only called by owner of auction
    */
     function transferHandleNameToWinner() internal returns (bool){
        
        auction[msg.sender].auctionConductor.transfer(auction[msg.sender].highestBid);
        auction[msg.sender].handleNameTransferred = true;
        require(registrarStorageContractAddress.transferhandleName(auction[msg.sender].handleName, auction[msg.sender].auctionConductor,auction[msg.sender].higestBidderAddress),"storage contract fails");

     }


    /**
    * @dev  to transfer handle name directly without Auction
    */
     function directlyTransferHandleName(string calldata _handleName, address _newOwner) external returns (bool){
     
        require (registrarStorageContractAddress.isHandleNameTakenByAddress( _handleName, msg.sender) == true,"you are not an owner of this handle name");        
        require(registrarStorageContractAddress.transferhandleName(_handleName, msg.sender,_newOwner),"storage contract fails");
        return true;
     }

    /**
    * @dev  to get array of bidders of particular auction
    * @param _auctioner address of a auctioner
    */
     function arrayOfbidders (address _auctioner) external view returns (address payable[] memory){
         
         require(auction[_auctioner].auctionConductor != address(0x0));
         return auction[_auctioner].biddersArray;
         
     }

    /**
    * @dev  to get bid of a participant in auction
    * @param _auctioner address of a auctioner
    * @param _bidder address of a participant
    */

     function getBidRate (address _auctioner, address _bidder) external view returns (uint256){
         
         require(auction[_auctioner].auctionConductor != address(0x0));
         return auction[_auctioner].bidRate[_bidder];
         
     }


}
