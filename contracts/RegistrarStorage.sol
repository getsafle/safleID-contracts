pragma solidity 0.5.0;

import "./checkingContract.sol";

contract RegistrarStorage is checkingContract {

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

    mapping (uint256 => bool ) public indexTaken;
    mapping (string => bool) blockchainName;
    mapping (string => mapping (string => bool)) nameAndAlias;

    mapping (uint256 => string)  public indexOfCoin;
    mapping(uint256 => mapping (string => string)) blockchainAlias;
    mapping (string => mapping (uint256 => string)) resolveCoinNames;
    mapping (string => mapping (uint256 => string)) coinAddressToHandleName;

    // Struct to store the Registrar data
    struct registrar {
        bool isRegisteredRegistrar;
        string registrarName;
        address registarAddress;
    }

    // Modifier to ensure the function caller is the contract owner
    modifier onlyOwner () {
        require(msg.sender == contractOwner);
        _;
    }

    // Modifier to ensure the function caller is the Registrar Main Contract
    modifier onlyMainContract () {
        require(msg.sender == mainContract);
        _;
    }

    uint256 public totalHandleNameRegistered;
    mapping( address => uint8 ) public updateCount;
    mapping( bytes => address ) handleNameToUser;
    mapping(bytes => bool) isHandleNameRegisteredAlready;
    mapping(address => bool) public validHandleNameAddress;
    mapping(address => string) addressToHandleName;
    mapping(string => bool) notAvailableHandleNames;
    mapping(address => bool) public auctionProcess;

    mapping( address => bytes[] ) public OldHandles;
    mapping( bytes => address )  OldUserHandleNameToAddress;

    // Modifier to ensure that the caller is the Auction Contract
    modifier auctionContract () {
        require(msg.sender == auctionContractAddress);
        _;
    }

    // Address of the Registrar Main Contract to be passed in the constructor
    constructor (address _mainContractAddress) public {
        contractOwner = msg.sender;
        mainContract = _mainContractAddress;
    }

    /**
    * @dev Update the Main Contract Address
    * Only the contract owner can call this function
    * @param _mainContractAddress main contract address
    */
    function upgradeMainContractAddress (address _mainContractAddress) external onlyOwner {
                mainContract = _mainContractAddress;
    }

    /**
    * @dev Register a new Registrar
    * Only the Main contract can call this function
    * @param _registrar address of the Registrar
    * @param _registrarName Registrar name
    * @return true
    */
    function registerRegistrar(address _registrar, string calldata _registrarName) external onlyMainContract returns(bool)  {

        bytes memory bytesVNinLowerCase = bytes(_registrarName);

        require(Registrars[_registrar].registarAddress == address(0x0), "Ragistrar registered");
        require(isRegistrarWithSameName[bytesVNinLowerCase] == false, "Ragistrar with the same name");
        require(validRegistrar[_registrar] == false, "Registrar is already validated by this address");
        require(isHandleNameRegisteredAlready[bytesVNinLowerCase] == false );

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
    * @dev Update an already registered Registrar
    * Only the Main contract can call this function
    * @param _registrar address of the Registrar
    * @param _registrarNewName new name of the Registrar to update
    * @return true
    */
    function updateRegistrar(address _registrar,string calldata _registrarNewName) external onlyMainContract returns (bool) {

        bytes memory bytesVNinLowerCase = bytes(_registrarNewName);

        require(Registrars[_registrar].registarAddress != address(0x0), "Ragistrar should register first");
        require(isRegistrarWithSameName[bytesVNinLowerCase] == false, "new name is already taken");
        require(updateRegistrarCount[_registrar]+1 <= MAX_REGISTRAR_NAME_UPDATE_ALLOW,"You have no more update count left");
        require(isHandleNameRegisteredAlready[bytesVNinLowerCase] == false );

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
    * @dev Resolve the registrar address from registrar name
    * @param _handleName handlename of the registrar
    * @return registrar address
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
    * @dev Resolve the registrar name from registrar address
    * @param _registrar address of the Registrar
    * @return registrar name
    */
    function resolveRegistrarFromaddress(address  _registrar)
    external
    view
    returns(string memory)

    {

        require(Registrars[_registrar].registarAddress != address(0x0),"Ragistrar not registered");
        return Registrars[_registrar].registrarName;

    }

    /**
    * @dev Register a user's address and handlename
    * Only the Main contract can call this function
    * @param _registrar address of the Registrar
    * @param _userAddress address of the new user
    * @param _handleName handlename of the new user
    * @return true
    */
    function setAddressAndHandleName(address _registrar, address _userAddress, string calldata _handleName)  external onlyMainContract returns(bool)
    {

        bytes memory bytesUNinLowerCase = bytes(toLower(_handleName));

        require(Registrars[_registrar].registarAddress != address(0x0), "Invalid Ragistrar");
        require(isRegistrarWithSameName[bytesUNinLowerCase] == false, "registrar with same name");
        require(isHandleNameRegisteredAlready[bytesUNinLowerCase] == false );
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
    * @dev Update the handlename of an already registered user
    * Only the Main contract can call this function
    * @param _registrar address of a Registrar
    * @param _userAddress address of the user
    * @param _handleName new handlename of that user
    * @return true
    */
    function updateHandleName(address _registrar, address _userAddress, string calldata _handleName)  external onlyMainContract returns(bool)
    {

        require(updateCount[_userAddress]+1 <= MAX_REGISTRAR_NAME_UPDATE_ALLOW);

        bytes memory bytesUNinLowerCase = bytes(toLower(_handleName));

        require(Registrars[_registrar].registarAddress != address(0x0));
        require(isRegistrarWithSameName[bytesUNinLowerCase]== false);
        require(validHandleNameAddress[_userAddress] == true);
        require(isHandleNameRegisteredAlready[bytesUNinLowerCase] == false );
        require(auctionProcess[_userAddress] == false);
        require(notAvailableHandleNames[_handleName] == false, "Handl name is already used once, not available now");

        string memory oldName = addressToHandleName[_userAddress];
        bytes memory bytesVNinLowerCaseOldaName = bytes(oldName);

        notAvailableHandleNames[oldName] = true;
        handleNameToUser[bytesVNinLowerCaseOldaName] = address(0x0);
        updateOldHandleNames(_userAddress,bytesVNinLowerCaseOldaName);
        isHandleNameRegisteredAlready[bytesVNinLowerCaseOldaName] = false;

        isHandleNameRegisteredAlready[bytesUNinLowerCase] = true;
        handleNameToUser[bytesUNinLowerCase] = _userAddress;
        addressToHandleName[_userAddress] = _handleName;

        updateCount[_userAddress]++;
        totalHandleNameRegistered++;

        return true;
    }

   /**
    * @dev Transfer the handlename of a user to a new user
    * Can only be called by the Auction contract
    * @param _handleName the handlename of the user to be trasferred
    * @param _oldOwner address of the old user
    * @param _newOwner address of the new user
    * @return true
    */
    function transferhandleName (string calldata _handleName, address _oldOwner, address _newOwner) external auctionContract returns (bool) {
        
        string memory VNinLowerCase = toLower(_handleName);
        bytes memory bytesUNinLowerCase = bytes(toLower(VNinLowerCase));

        require(validHandleNameAddress[_oldOwner] == true);
        require(isHandleNameRegisteredAlready[bytesUNinLowerCase] == true );

        updateOldHandleNames(_oldOwner,bytesUNinLowerCase);
        validHandleNameAddress[_oldOwner] = false;

        handleNameToUser[bytesUNinLowerCase] = _newOwner;

        auctionProcess[_oldOwner] = false;
        validHandleNameAddress[_newOwner] = true;
        addressToHandleName[_newOwner] = VNinLowerCase;
        return true;

    }

    /**
    * @dev Update the handlename inside the array
    * This function can only be called internally
    * @param _userAddress the address of the user
    * @param _handleName the handlename to be updated in bytes
    */
    function updateOldHandleNames(address _userAddress, bytes memory _handleName )
    internal
    {
        OldHandles[_userAddress].push(_handleName);
        OldUserHandleNameToAddress[_handleName] = _userAddress;
    }

    /**
    * @dev resolve the address of the user using handlename
    * @param _handleName handlename of the user
    * @return address associated to that particular address
    */
    function resolveHandleNameString(string calldata _handleName)
    external
    view
    returns(address)
    {
        string memory VNinLowerCase = toLower(_handleName);
        bytes memory bytesVNinLowerCase = bytes(VNinLowerCase);
        require(bytes(_handleName).length != 0, "Resolver : user handle name should not be empty.");
        require(handleNameToUser[bytesVNinLowerCase] != address(0x0), "Resolver : user is not yet registered for this handle name.");
        return handleNameToUser[bytesVNinLowerCase];
    }

    /**
    * @dev Set the auction contract address
    * This function can only be called by the contract owner
    * @param _auctionAddress address of a auction contract
    * @return true
    */
    function setAuctionContract (address _auctionAddress) external onlyOwner returns(bool){

       auctionContractAddress = _auctionAddress;
       return true;
    }

    /**
    * @dev Resolve the address from handlename or registrar name
    * @param _handleName handlename of a user or ragistrar name
    * @return address of the user or Registrar
    */
    function resolveHandleNameOrRegistrarName(string calldata _handleName)
    external
    view
    returns(address)
    {
        string memory VNinLowerCase = toLower(_handleName);
        bytes memory bytesVNinLowerCase = bytes(VNinLowerCase);
        require(bytes(_handleName).length != 0, "Resolver : user handle name should not be empty.");

        if(handleNameToUser[bytesVNinLowerCase] != address(0x0)) {

            return handleNameToUser[bytesVNinLowerCase];

        } else if(AllRegistrarHandleNameToAddress[bytesVNinLowerCase] != address(0x0))
        {

            return AllRegistrarHandleNameToAddress[bytesVNinLowerCase];

        } else {
            return address(0x0);
        }

    }

    /**
    * @dev Check if the handlename or Registrar name is taken
    * @param _handleName handlename of a user or Registrar name
    * @param _address address of a user or Registrar
    * @return true if the handlename or Registrar name is taken, else false
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

        } else {

            return false;
        }

    }

    /**
    * @dev Update the data for the active auction
    * @param _handleNameOwner address of a handlename owner
    * @param _handleName handlename in string
    * @return true
    */
    function auctionInProcess (address _handleNameOwner, string calldata _handleName) external auctionContract returns (bool) {

        bytes memory bytesVNinLowerCase = bytes(_handleName);

        require(bytes(_handleName).length != 0, "Resolver : user handle name should not be empty.");
        require(handleNameToUser[bytesVNinLowerCase] != address(0x0), "Resolver : User is not yet registered for this handle name.");
        auctionProcess[_handleNameOwner] = true;
        return true;

    }

    /**
    * @dev Add a new coin address mapping
    * Can only be called by the Main Contract
    * @param _indexnumber index of the new coin
    * @param _blockchainName blockchain name of the coin
    * @param _aliasName alias name of the coin
    * @return true
    */
    function addCoin(uint256 _indexnumber, string calldata _blockchainName, string calldata _aliasName, address _registrar) external onlyMainContract returns (bool){

        require(indexTaken[_indexnumber] == false );
        require (blockchainName [_blockchainName] == false);
        require(nameAndAlias[_blockchainName][_aliasName] == false);
        require(Registrars[_registrar].registarAddress != address(0x0),"Invalid Ragistrar");

        indexTaken[_indexnumber] = true;
        indexOfCoin[_indexnumber] = _blockchainName;
        blockchainName[_blockchainName] = true;
        blockchainAlias[_indexnumber][_blockchainName] = _aliasName;
        return true;

    }

    /**
    * @dev Get the coin name by passing in the index number
    * @param _index index of the coin
    * @return coin name in string
    */
    function getCoinAliasNameByIndex (uint256 _index) external view returns (string memory) {

    require(_index != 0);
    require (indexTaken[_index] == true);
    string memory tempName = indexOfCoin[_index];
    return blockchainAlias[_index][tempName];

    }

    /**
    * @dev Check if a particular coin is mapped
    * @param _blockchainName string of a blockchain name
    * @return true if registered, else false
    */
    function isCoinRegistered (string calldata _blockchainName) external view returns (bool) {

        string memory lowerBlockchainName = toLower(_blockchainName);

        return blockchainName[lowerBlockchainName];
    }

    /**
    * @dev Register other coin address of a user
    * This function can only be called by the Main Contract
    * @param _userAddress address of a user
    * @param _index index of the blockchain
    * @param _address address of the coin
    * @param _registrar address of the Registrar
    * @return true
    */
    function registerCoinAddress(address _userAddress,uint256 _index, string calldata _address, address _registrar) external onlyMainContract returns (bool){

        string memory handleName = addressToHandleName[_userAddress];
        require(Registrars[_registrar].registarAddress != address(0x0),"Invalid Ragistrar");
        require (auctionProcess[_userAddress] == false);
        require(indexTaken[_index] == true);
        coinAddressToHandleName[handleName][_index] = _address;
        resolveCoinNames[_address][_index] = handleName;
        return true;
    }

    /**
    * @dev Update the coin address of a user
    * This function can only be called by the Main Contract
    * @param _userAddress address of the user
    * @param _index index of the blockchain
    * @param _newAddress new address of coin to be updated
    * @param _registrar address of the Registrar
    * @return true
    */
    function updateCoinAddress(address _userAddress,uint256 _index, string calldata _newAddress, address _registrar) external onlyMainContract returns (bool){

        string memory handleName = addressToHandleName[_userAddress];
        require(Registrars[_registrar].registarAddress != address(0x0), "Invalid Registrar");
        require (auctionProcess[_userAddress] == false);
        require(indexTaken[_index] == true);
        string memory previousAddress = coinAddressToHandleName[handleName][_index];
        require(checkLength(previousAddress) > 0);

        coinAddressToHandleName[handleName][_index] = _newAddress;
        resolveCoinNames[_newAddress][_index] = handleName;
        return true;

    }

    /**
    * @dev Resolve the address of a coin from user's handlename and index
    * @param _handleName user handlename string
    * @param _index index of the blockchain address mapping
    * @return user's coin address
    */
    function resolveCoinAddress (string calldata _handleName, uint256 _index) external view returns (string memory) {

        string memory handleName = toLower(_handleName);
        require(indexTaken[_index] == true);
        return coinAddressToHandleName[handleName][_index];
    }

    /**
    * @dev resolve the user's handlename from their coin address and index number
    * @param _address user's coin address
    * @param _index index of the blockchain
    * @return handlename of the user
    */
    function resolveCoinHandleName (string calldata _address, uint256 _index) external view returns (string memory) {

        string memory otherAddress = toLower(_address);
        require(indexTaken[_index] == true);
        return resolveCoinNames[otherAddress][_index];
    }

    /**
    * @dev Resolve the handlename of the user from address
    * @param _userAddress address of the user
    * @return handlename of the user
    */
    function resolveHandleName (address _userAddress) external view returns (string memory) {

        require(_userAddress != address(0));
        require(validHandleNameAddress[_userAddress], "Not a valid user address");
        return addressToHandleName[_userAddress];
    }

}