pragma solidity 0.5.0;

import "./checkingContract.sol";

contract RegistrarStorage is checkingContract{

// registrar variable declaration

    uint8 constant MAX_REGISTRAR_NAME_UPDATE_ALLOW = 2;
    uint256 public totalRegistrars;

    address public contractOwner;
    address public mainContract;
    address public auctionContractAddress;

    mapping( address => uint8 ) public updateRegistrarCount;
    mapping( address => bytes[] ) public OldRegistrarAddressToNames;

    mapping( bytes => address )  AllRegistrarHandleNameToAddress;
    mapping (address => registrar) public Registrars;
    mapping(bytes => bool)  isRegistrarWithSameName;
    mapping (address => bool) public validRegistrar;



   // other blockchain

   mapping (uint256 => bool ) public indexTaken;
   mapping (string => bool) blockchainName;
   mapping (string => mapping (string => bool)) nameAndAlias;


   mapping (uint256 => string)  public indexOfCoin;
   mapping(uint256 => mapping (string => string)) blockchainAlias;
   mapping (string => mapping (uint256 => string)) resolveCoinNames; //other blockchain address first
   mapping (string => mapping (uint256 => string)) coinAddressToHandleName;   //address later, first handle name 
       
   
// end other blockchain
   

    struct registrar {

        bool isRegisteredRegistrar;
        string registrarName;
        address registarAddress;

    }
    
    modifier onlyOwner () {
        require(msg.sender == contractOwner);
        _;
    }
    
    modifier onlyMainContract () {
        require(msg.sender == mainContract);
        _;
    }

// Handle name variable declaration

    uint256 public totalHandleNameRegistered;
    mapping( address => uint8 ) public updateCount;
    mapping( bytes => address ) handleNameToUser;
    mapping(bytes => bool) isHandleNameRegisteredAlready;
    mapping(address => bool) public validHandleNameAddress;
    mapping(address => string) addressToHandleName;    
    mapping(string => bool) notAvailableHandleNames;
    mapping(address => bool) public auctionProcess;  

    //update below variables when there is an update. To make sure that we have the previous data available all the time on chain
    mapping( address => bytes[] ) public OldHandles;
    mapping( bytes => address )  OldUserHandleNameToAddress;

    modifier auctionContract () {

        require(msg.sender == auctionContractAddress);
        _;
    }

    constructor (address _mainContractAddress) public {
       
        contractOwner = msg.sender ;
        mainContract = _mainContractAddress;

    }
    
    /**
    * @dev  to update Main Contract Address 
    * @param _mainContractAddress main contract address
    */

    function upgradeMainContractAddress (address _mainContractAddress) external onlyOwner {
        
                mainContract = _mainContractAddress;
    }

    /**
    * @dev  to add a new Ragistrar  
    * @param _registrar address of a Ragistrar
    * @param _registrarName string as a Ragistrar name
    */
    function registerRegistrar(address _registrar,string calldata _registrarName) external onlyMainContract returns(bool)  {


        bytes memory bytesVNinLowerCase = bytes(_registrarName);

        require(Registrars[_registrar].registarAddress == address(0x0),"Ragistrar registered");
        require(isRegistrarWithSameName[bytesVNinLowerCase]== false,"Ragistrar with the same name");
        require(validRegistrar[_registrar] == false,"Registrar is already validated by this address");
        require(isHandleNameRegisteredAlready[bytesVNinLowerCase] == false ); // handle name is free to taken        

        Registrars[_registrar].isRegisteredRegistrar = true;
        Registrars[_registrar].registrarName = _registrarName;
        Registrars[_registrar].registarAddress = _registrar;

        isRegistrarWithSameName[bytesVNinLowerCase] = true;
        AllRegistrarHandleNameToAddress[bytesVNinLowerCase] = _registrar;
        validRegistrar[_registrar] = true;
        totalRegistrars++;

        return true;

    }

    /**
    * @dev  to update an old Ragistrar  
    * @param _registrar address of a Ragistrar
    * @param _registrarNewName string as a Ragistrar new name
    */
    function updateRegistrar(address _registrar,string calldata _registrarNewName) external onlyMainContract returns (bool) {


        bytes memory bytesVNinLowerCase = bytes(_registrarNewName);

        require(Registrars[_registrar].registarAddress !=address(0x0),"Ragistrar should register first");
        require(isRegistrarWithSameName[bytesVNinLowerCase]== false,"new name is already taken");
        require(updateRegistrarCount[_registrar]+1 <= MAX_REGISTRAR_NAME_UPDATE_ALLOW,"You have no more update count left");
        require(isHandleNameRegisteredAlready[bytesVNinLowerCase] == false ); // handle name is free to taken
        
        
        registrar memory registrarObject = Registrars[_registrar];
        string memory oldName = registrarObject.registrarName; 
        bytes memory bytesVNinLowerCaseOldaName = bytes(oldName);
        isRegistrarWithSameName[bytesVNinLowerCaseOldaName] = false;
        AllRegistrarHandleNameToAddress[bytesVNinLowerCaseOldaName] = address(0x0);

        OldRegistrarAddressToNames[_registrar].push(bytes(Registrars[_registrar].registrarName));
        
        Registrars[_registrar].isRegisteredRegistrar = true;
        Registrars[_registrar].registrarName = _registrarNewName;
        Registrars[_registrar].registarAddress = _registrar;


        isRegistrarWithSameName[bytesVNinLowerCase] = true;
        AllRegistrarHandleNameToAddress[bytesVNinLowerCase] = _registrar;
        updateRegistrarCount[_registrar]++;
        return true;


    }

    /**
    * @dev  to get address from handle name  
    * @param _handleName handle name of a user
    */
    function resolveRegistrarFromHandleNameString(string calldata _handleName) 
    external
    view
    returns(address) 
    
    {   

        bytes memory bytesVNinLowerCase = bytes(_handleName);
        require(bytes(_handleName).length != 0, "Resolver : user handle name should not be empty.");
        require(AllRegistrarHandleNameToAddress[bytesVNinLowerCase] != address(0x0), "Resolver : Ragistrar is not yet registered for this handle name.");
        return AllRegistrarHandleNameToAddress[bytesVNinLowerCase];
    }    

    /**
    * @dev  to get a Ragistrar name from address  
    * @param _registrar address of a Ragistrar
    */
    function resolveRegistrarFromaddress(address  _registrar) 
    external
    view
    returns(string memory) 
    
    {   

        require(Registrars[_registrar].registarAddress != address(0x0),"Ragistrar not registered");
        return Registrars[_registrar].registrarName;

    }    



// handle name functions

    /**
    * @dev  to add a new handle name of user  
    * @param _registrar address of a Ragistrar
    * @param _userAddress address of a user
    * @param _handleName handle name of a new user
    */
    function setAddressAndHandleName(address _registrar, address _userAddress, string calldata _handleName)  external onlyMainContract returns(bool) 
    {

        bytes memory bytesUNinLowerCase = bytes(toLower(_handleName));

        require(Registrars[_registrar].registarAddress != address(0x0),"Invalid Ragistrar"); // valid registrar
        require(isRegistrarWithSameName[bytesUNinLowerCase]== false,"registrar with same name");    // Registrar not takeken this handle name
        require(isHandleNameRegisteredAlready[bytesUNinLowerCase] == false ); // handle name is free to taken
        require(validHandleNameAddress[_userAddress] == false,"Handle name already registered");
        require(notAvailableHandleNames[_handleName] == false, "Handl name is already used once, not available now");

        handleNameToUser[bytesUNinLowerCase] = _userAddress;
        validHandleNameAddress[_userAddress] = true;
        addressToHandleName[_userAddress] = _handleName;
        totalHandleNameRegistered++;
        isHandleNameRegisteredAlready[bytesUNinLowerCase] = true;

        return true;

    }
    
    /**
    * @dev  to add a new handle name of user  
    * @param _registrar address of a Ragistrar
    * @param _userAddress address of a user
    * @param _handleName new handle name of an old user
    */
    function updateHandleName(address _registrar, address _userAddress, string calldata _handleName)  external onlyMainContract returns(bool) 
    {

        require(updateCount[_userAddress]+1 <= MAX_REGISTRAR_NAME_UPDATE_ALLOW); 

        bytes memory bytesUNinLowerCase = bytes(toLower(_handleName));

        require(Registrars[_registrar].registarAddress != address(0x0)); // valid registrar
        require(isRegistrarWithSameName[bytesUNinLowerCase]== false);    // Registrar not takeken this handle name
        require(validHandleNameAddress[_userAddress] == true);
        require(isHandleNameRegisteredAlready[bytesUNinLowerCase] == false );
        require(auctionProcess[_userAddress] == false);
        require(notAvailableHandleNames[_handleName] == false, "Handl name is already used once, not available now");
        //free previous handle name hold by this user 

        string memory oldName = addressToHandleName[_userAddress]; 
        bytes memory bytesVNinLowerCaseOldaName = bytes(oldName);


        notAvailableHandleNames[oldName] = true;
        handleNameToUser[bytesVNinLowerCaseOldaName] = address(0x0);
        updateOldHandleNames(_userAddress,bytesVNinLowerCaseOldaName);
        isHandleNameRegisteredAlready[bytesVNinLowerCaseOldaName] =false;


        isHandleNameRegisteredAlready[bytesUNinLowerCase] = true;
        handleNameToUser[bytesUNinLowerCase] = _userAddress;
        addressToHandleName[_userAddress] = _handleName;
    
        updateCount[_userAddress]++;
        totalHandleNameRegistered++;

        return true;
    }

   /**
    * @dev  to transfer a new handle name of an old user to new user  
    * @param _handleName new handle name of an old user
    * @param _oldOwner address of an old user
    * @param _newOwner address of an new user
    */
    function transferhandleName (string calldata _handleName, address _oldOwner, address _newOwner) external auctionContract returns (bool) {
        
        string memory VNinLowerCase = toLower(_handleName);
        bytes memory bytesUNinLowerCase = bytes(toLower(VNinLowerCase));

        require(validHandleNameAddress[_oldOwner] == true);
        require(isHandleNameRegisteredAlready[bytesUNinLowerCase] == true );

        //remove 
        updateOldHandleNames(_oldOwner,bytesUNinLowerCase);
        validHandleNameAddress[_oldOwner] = false;
                
                
        handleNameToUser[bytesUNinLowerCase] = _newOwner;
        
        auctionProcess[_oldOwner] = false;
        validHandleNameAddress[_newOwner] =true;
        addressToHandleName[_newOwner] = VNinLowerCase;
        return true;
        
    }

    /**
    * @dev  update old handle names to old handles array  
    * @param _userAddress new handle name of an old user
    * @param _handleName bytes of an old user handle name
    */

    function updateOldHandleNames(address _userAddress, bytes memory _handleName ) 
    internal 
    {
        OldHandles[_userAddress].push(_handleName);
        OldUserHandleNameToAddress[_handleName]=_userAddress;
    }

    /**
    * @dev  get user address by user handle name  
    * @param _handleName handle name of an user
    */
    function resolveHandleNameString(string calldata _handleName) 
    external 
    view 
    returns(address) 
    {   string memory VNinLowerCase = toLower(_handleName);
        bytes memory bytesVNinLowerCase = bytes(VNinLowerCase);
        require(bytes(_handleName).length != 0, "Resolver : user handle name should not be empty.");
        require(handleNameToUser[bytesVNinLowerCase] != address(0x0), "Resolver : user is not yet registered for this handle name.");
        return handleNameToUser[bytesVNinLowerCase];
    }

    /**
    * @dev  set auction contract address by owner only  
    * @param _auctionAddress address of a auction contract
    */

    function setAuctionContract (address _auctionAddress) external onlyOwner returns(bool){
        
       auctionContractAddress = _auctionAddress;        
       return true;        
    }

    /**
    * @dev  get Ragistrar or user address by Ragistrar name or user handle name 
    * @param _handleName handle name of a user or ragistrar name 
    */

    function resolveHandleNameOrRegistrarName(string calldata _handleName) 
    external 
    view 
    returns(address) 
    {
       string memory VNinLowerCase = toLower(_handleName);
        bytes memory bytesVNinLowerCase = bytes(VNinLowerCase);
        require(bytes(_handleName).length != 0, "Resolver : user handle name should not be empty.");
        
        if(handleNameToUser[bytesVNinLowerCase] != address(0x0)){

               return handleNameToUser[bytesVNinLowerCase];

            
        }else if(AllRegistrarHandleNameToAddress[bytesVNinLowerCase] != address(0x0))
        {
            
            return AllRegistrarHandleNameToAddress[bytesVNinLowerCase];
            
        }else {
            
            return address(0x0);
        }
    
     
    }

    /**
    * @dev  to know if handlename or a ragistrar name taken by any user or ragistrar 
    * @param _handleName handle name of a user or ragistrar name 
    * @param _address address of a user or ragistrar
    */

    function isHandleNameTakenByAddress(string calldata _handleName, address _address) 
    external 
    view 
    returns(bool) 
    {
        string memory VNinLowerCase = toLower(_handleName);
        bytes memory bytesVNinLowerCase = bytes(VNinLowerCase);
        require(bytes(_handleName).length != 0, "Resolver : user handle name should not be empty.");
        
        if(handleNameToUser[bytesVNinLowerCase] == _address || AllRegistrarHandleNameToAddress[bytesVNinLowerCase] == _address){

               return true;

            
        }else {
            
            return false;
        }
    
     
    }

    /**
    * @dev  to update auction in process 
    * @param _handleNameOwner address of a handle name owner 
    * @param _handleName string of a handlename
    */

   function auctionInProcess (address _handleNameOwner, string calldata _handleName) external auctionContract returns  (bool)
   {

        bytes memory bytesVNinLowerCase = bytes(_handleName);

        require(bytes(_handleName).length != 0, "Resolver : user handle name should not be empty.");
        require(handleNameToUser[bytesVNinLowerCase] != address(0x0), "Resolver : User is not yet registered for this handle name.");
        auctionProcess[_handleNameOwner] = true;
        return true;

   }

    /**
    * @dev  to add new coin  
    * @param _indexnumber index of a new coin
    * @param _blockchainName string of a blockchain name of a coin
    * @param _aliasName string of a alias name of a blockchain or coin
    */
   function addCoin(uint256 _indexnumber, string calldata _blockchainName, string calldata _aliasName, address _registrar) external onlyMainContract returns (bool){

        
        require(indexTaken[_indexnumber] == false );
        require (blockchainName [_blockchainName] == false);
        require(nameAndAlias[_blockchainName][_aliasName] == false);
        require(Registrars[_registrar].registarAddress != address(0x0),"Invalid Ragistrar"); // valid registrar

        indexTaken[_indexnumber] = true;
        indexOfCoin[_indexnumber] = _blockchainName;
        blockchainName[_blockchainName] = true;
        blockchainAlias[_indexnumber][_blockchainName] = _aliasName;
        return true;
       
   }

    /**
    * @dev  to get new coin alias name by index 
    * @param _index index of a new coin
    */

   function getCoinAliasNameByIndex (uint256 _index) external view returns (string memory)
   {

    require(_index != 0);
    require (indexTaken[_index] == true);
    string memory tempName = indexOfCoin[_index];
    return blockchainAlias[_index][tempName];

   }

    /**
    * @dev  to check if coin is registered by blockchain name
    * @param _blockchainName string of a blockchain name
    */

   function isCoinRegistered (string calldata _blockchainName) external view returns (bool)
   {

        string memory lowerBlockchainName = toLower(_blockchainName);
        
        return blockchainName[lowerBlockchainName];
   }

    /**
    * @dev  to register coin address with handle name
    * @param _userAddress address of a user
    * @param _index index of a blockchain 
    * @param _address string of a address of coin
    */

    function registerCoinAddress(address _userAddress,uint256 _index, string calldata _address, address _registrar) external onlyMainContract returns (bool){
        
        string memory handleName = addressToHandleName[_userAddress];
        require(Registrars[_registrar].registarAddress != address(0x0),"Invalid Ragistrar"); // valid registrar
        require (auctionProcess[_userAddress] == false);
        require(indexTaken[_index] == true);
        coinAddressToHandleName[handleName][_index] = _address;
        resolveCoinNames[_address][_index] = handleName;
        return true;
    }


    /**
    * @dev  to update coin address with handle name
    * @param _userAddress address of a user
    * @param _index index of a blockchain 
    * @param _newAddress string of a address of coin
    */

    function updateCoinAddress(address _userAddress,uint256 _index, string calldata _newAddress, address _registrar) external onlyMainContract returns (bool){
        
        string memory handleName = addressToHandleName[_userAddress];
        require(Registrars[_registrar].registarAddress != address(0x0),"Invalid Ragistrar"); // valid registrar
        require (auctionProcess[_userAddress] == false);
        require(indexTaken[_index] == true);
        string memory previousAddress = coinAddressToHandleName[handleName][_index];
        require(checkLength(previousAddress) > 0);
        
        coinAddressToHandleName[handleName][_index] = _newAddress;
        resolveCoinNames[_newAddress][_index] = handleName;
        return true;

    }
    
    /**
    * @dev  to get a string of a address from handle name and index of a coin
    * @param _handleName string of a user handle name
    * @param _index index of a blockchain 
    */
    
   function resolveCoinAddress (string calldata _handleName, uint256 _index) external view returns (string memory)
   {

        string memory handleName = toLower(_handleName);
        require(indexTaken[_index] == true);
        return coinAddressToHandleName[handleName][_index];
   }
    
    /**
    * @dev  to get a string of a handle name from address of a coin and index
    * @param _address string of a user address
    * @param _index index of a blockchain 
    */
    
   function resolveCoinHandleName (string calldata _address, uint256 _index) external view returns (string memory)
   {

        string memory otherAddress = toLower(_address);
        require(indexTaken[_index] == true);
        return resolveCoinNames[otherAddress][_index];
   }

    /**
    * @dev  to get a string of a handle name from address of a user
    * @param _userAddress address of a user
    */

    function resolveHandleName (address _userAddress) external view returns (string memory)
   {

        require(_userAddress != address(0));
        require(validHandleNameAddress[_userAddress],"Not a valid user address");
        return addressToHandleName[_userAddress];
   }
 
}