pragma solidity 0.5.0;

import "./checkingContract.sol";

contract RegistrarStorage is checkingContract {

    // State variables to keep track of counts
    uint8 constant MAX_NAME_UPDATES = 2;
    uint256 public totalRegistrars;
    mapping( address => uint8 ) public totalRegistrarUpdates;
    uint256 public totalInbloxIdRegistered;
    mapping( address => uint8 ) public totalInbloxIDCount;

    // State variables to manage contract addresses
    address public contractOwner;
    address public mainContract;
    address public auctionContractAddress;

    mapping( address => bytes[] ) public resolveOldRegistrarAddress;

    mapping( bytes => address )  registrarNameToAddress;
    mapping (address => registrar) public Registrars;

    //  Mappings to keep track of other coin address mapping and registration
    mapping (uint256 => bool ) public indexTaken;
    mapping (string => bool) isCoinMapped;
    mapping (string => mapping (string => bool)) nameAndAlias;
    mapping (uint256 => string)  public indexOfCoin;
    mapping(uint256 => mapping (string => string)) blockchainAlias;
    mapping (string => mapping (uint256 => string)) resolveInbloxIdFromCoinAddress;
    mapping (string => mapping (uint256 => string)) inbloxIdToCoinAddress;

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

    mapping( bytes => address ) resolveAddressFromInbloxId;
    mapping(address => bool) public isAddressTaken;
    mapping(address => string) public resolveUserAddress;
    mapping(string => bool) unavailableInbloxIds;
    mapping(address => bool) public auctionProcess;

    mapping( address => bytes[] ) public resolveOldInbloxIdFromAddress;
    mapping( bytes => address )  resolveOldInbloxID;

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

        bytes memory regNameBytes = bytes(_registrarName);

        require(Registrars[_registrar].registarAddress == address(0x0), "Registrar registered");
        require(registrarNameToAddress[regNameBytes] == address(0x0), "Registrar name is already taken");
        require(isAddressTaken[_registrar] == false, "Registrar is already validated by this address");
        require(resolveAddressFromInbloxId[regNameBytes] == address(0x0), "This Registrar name is already registered as an InbloxID.");

        Registrars[_registrar].isRegisteredRegistrar = true;
        Registrars[_registrar].registrarName = _registrarName;
        Registrars[_registrar].registarAddress = _registrar;

        registrarNameToAddress[regNameBytes] = _registrar;
        isAddressTaken[_registrar] = true;
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
    function updateRegistrar(address _registrar, string calldata _registrarNewName) external onlyMainContract returns (bool) {

        bytes memory regNewNameBytes = bytes(_registrarNewName);

        require(Registrars[_registrar].registarAddress != address(0x0), "Registrar should register first");
        require(registrarNameToAddress[regNewNameBytes] == address(0x0), "Registrar name is already taken");
        require(totalRegistrarUpdates[_registrar]+1 <= MAX_NAME_UPDATES, "You have no more update count left");
        require(resolveAddressFromInbloxId[regNewNameBytes] == address(0x0), "This Registrar name is already registered as an InbloxID.");

        registrar memory registrarObject = Registrars[_registrar];
        string memory oldName = registrarObject.registrarName;
        bytes memory regOldNameBytes = bytes(oldName);
        registrarNameToAddress[regOldNameBytes] = address(0x0);

        resolveOldRegistrarAddress[_registrar].push(bytes(Registrars[_registrar].registrarName));
        
        Registrars[_registrar].isRegisteredRegistrar = true;
        Registrars[_registrar].registrarName = _registrarNewName;
        Registrars[_registrar].registarAddress = _registrar;

        registrarNameToAddress[regNewNameBytes] = _registrar;
        totalRegistrarUpdates[_registrar]++;
        return true;

    }

    /**
    * @dev Resolve the registrar address from registrar name
    * @param _inbloxId inbloxId of the registrar
    * @return registrar address
    */
    function resolveRegistrarName(string calldata _inbloxId)
    external
    view
    returns(address)

    {
        bytes memory regNameBytes = bytes(_inbloxId);
        require(bytes(_inbloxId).length != 0, "Resolver : InbloxId should not be empty.");
        require(registrarNameToAddress[regNameBytes] != address(0x0), "Resolver : Registrar is not yet registered for this InbloxID.");
        return registrarNameToAddress[regNameBytes];
    }

    /**
    * @dev Resolve the registrar name from registrar address
    * @param _registrar address of the Registrar
    * @return registrar name
    */
    function resolveRegistrarAddress(address  _registrar)
    external
    view
    returns(string memory)

    {

        require(Registrars[_registrar].registarAddress != address(0x0),"Registrar not registered");
        return Registrars[_registrar].registrarName;

    }

    /**
    * @dev Register a user's address and inbloxId
    * Only the Main contract can call this function
    * @param _registrar address of the Registrar
    * @param _userAddress address of the new user
    * @param _inbloxId inbloxId of the new user
    * @return true
    */
    function registerInbloxId(address _registrar, address _userAddress, string calldata _inbloxId)  external onlyMainContract returns(bool)
    {

        bytes memory idBytes = bytes(_inbloxId);

        require(Registrars[_registrar].registarAddress != address(0x0), "Invalid Registrar");
        require(registrarNameToAddress[idBytes] == address(0x0), "This ID is taken by a Registrar");
        require(resolveAddressFromInbloxId[idBytes] == address(0x0), "This InbloxId is already registered.");
        
        require(isAddressTaken[_userAddress] == false, "InbloxID already registered");
        require(unavailableInbloxIds[_inbloxId] == false, "InbloxId is already used once, not available now");

        resolveAddressFromInbloxId[idBytes] = _userAddress;
        isAddressTaken[_userAddress] = true;
        resolveUserAddress[_userAddress] = _inbloxId;
        totalInbloxIdRegistered++;

        return true;

    }

    /**
    * @dev Update the inbloxId of an already registered user
    * Only the Main contract can call this function
    * @param _registrar address of a Registrar
    * @param _userAddress address of the user
    * @param _inbloxId new inbloxId of that user
    * @return true
    */
    function updateInbloxId(address _registrar, address _userAddress, string calldata _inbloxId)  external onlyMainContract returns(bool)
    {

        require(totalInbloxIDCount[_userAddress]+1 <= MAX_NAME_UPDATES);

        bytes memory idBytes = bytes(_inbloxId);

        require(Registrars[_registrar].registarAddress != address(0x0));
        require(registrarNameToAddress[idBytes] == address(0x0), "Registrar name is already taken");
        require(isAddressTaken[_userAddress] == true);
        require(resolveAddressFromInbloxId[idBytes] == address(0x0), "This InbloxId is already registered.");
        require(auctionProcess[_userAddress] == false);
        require(unavailableInbloxIds[_inbloxId] == false, "InbloxId is already used once, not available now");

        string memory oldName = resolveUserAddress[_userAddress];
        bytes memory oldIdBytes = bytes(oldName);

        unavailableInbloxIds[oldName] = true;
        resolveAddressFromInbloxId[oldIdBytes] = address(0x0);
        oldInbloxIds(_userAddress,oldIdBytes);

        resolveAddressFromInbloxId[idBytes] = _userAddress;
        resolveUserAddress[_userAddress] = _inbloxId;

        totalInbloxIDCount[_userAddress]++;
        totalInbloxIdRegistered++;

        return true;
    }

   /**
    * @dev Transfer the inbloxId of a user to a new user
    * Can only be called by the Auction contract
    * @param _inbloxId the inbloxId of the user to be trasferred
    * @param _oldOwner address of the old user
    * @param _newOwner address of the new user
    * @return true
    */
    function transferInbloxId (string calldata _inbloxId, address _oldOwner, address _newOwner) external auctionContract returns (bool) {
        
        bytes memory idBytes = bytes(_inbloxId);

        require(isAddressTaken[_oldOwner] == true);
        require(resolveAddressFromInbloxId[idBytes] != address(0x0), "This InbloxId does not have an owner.");

        oldInbloxIds(_oldOwner,idBytes);
        isAddressTaken[_oldOwner] = false;

        resolveAddressFromInbloxId[idBytes] = _newOwner;

        auctionProcess[_oldOwner] = false;
        isAddressTaken[_newOwner] = true;
        resolveUserAddress[_newOwner] = _inbloxId;
        return true;

    }

    /**
    * @dev Update the inbloxId inside the array
    * This function can only be called internally
    * @param _userAddress the address of the user
    * @param _inbloxId the inbloxId to be updated in bytes
    */
    function oldInbloxIds(address _userAddress, bytes memory _inbloxId )
    internal
    {
        resolveOldInbloxIdFromAddress[_userAddress].push(_inbloxId);
        resolveOldInbloxID[_inbloxId] = _userAddress;
    }

    /**
    * @dev resolve the address of the user using inbloxId
    * @param _inbloxId inbloxId of the user
    * @return address associated to that particular address
    */
    function resolveInbloxId(string calldata _inbloxId)
    external
    view
    returns(address)
    {
        bytes memory idBytes = bytes(_inbloxId);
        require(bytes(_inbloxId).length != 0, "Resolver : user InbloxID should not be empty.");
        require(resolveAddressFromInbloxId[idBytes] != address(0x0), "Resolver : User is not yet registered for this InbloxID.");
        return resolveAddressFromInbloxId[idBytes];
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
    * @dev Check if the inbloxId or Registrar name is taken
    * @param _inbloxId inbloxId of a user or Registrar name
    * @param _address address of a user or Registrar
    * @return true if the inbloxId or Registrar name is taken, else false
    */
    function isInbloxIdTakenByAddress(string calldata _inbloxId, address _address)
    external
    view
    returns(bool)
    {
        bytes memory idBytes = bytes(_inbloxId);
        require(bytes(_inbloxId).length != 0, "Resolver : user InbloxID should not be empty.");

        if(resolveAddressFromInbloxId[idBytes] == _address || registrarNameToAddress[idBytes] == _address){

            return true;

        } else {

            return false;
        }

    }

    /**
    * @dev Update the data for the active auction
    * @param _inbloxIdOwner address of a inbloxId owner
    * @param _inbloxId inbloxId in string
    * @return true
    */
    function auctionInProcess (address _inbloxIdOwner, string calldata _inbloxId) external auctionContract returns (bool) {

        bytes memory idBytes = bytes(_inbloxId);

        require(bytes(_inbloxId).length != 0, "Resolver : User InbloxID should not be empty.");
        require(resolveAddressFromInbloxId[idBytes] != address(0x0), "Resolver : User is not yet registered for this InbloxID.");
        auctionProcess[_inbloxIdOwner] = true;
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
        require (isCoinMapped [_blockchainName] == false);
        require(nameAndAlias[_blockchainName][_aliasName] == false);
        require(Registrars[_registrar].registarAddress != address(0x0),"Invalid Registrar");

        indexTaken[_indexnumber] = true;
        indexOfCoin[_indexnumber] = _blockchainName;
        isCoinMapped[_blockchainName] = true;
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

        string memory bnameLower = toLower(_blockchainName);

        return isCoinMapped[bnameLower];
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

        string memory inbloxId = resolveUserAddress[_userAddress];
        require(Registrars[_registrar].registarAddress != address(0x0),"Invalid Registrar");
        require (auctionProcess[_userAddress] == false);
        require(indexTaken[_index] == true);
        inbloxIdToCoinAddress[inbloxId][_index] = _address;
        resolveInbloxIdFromCoinAddress[_address][_index] = inbloxId;
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

        string memory inbloxId = resolveUserAddress[_userAddress];
        require(Registrars[_registrar].registarAddress != address(0x0), "Invalid Registrar");
        require (auctionProcess[_userAddress] == false);
        require(indexTaken[_index] == true);
        string memory previousAddress = inbloxIdToCoinAddress[inbloxId][_index];
        require(checkLength(previousAddress) > 0);

        inbloxIdToCoinAddress[inbloxId][_index] = _newAddress;
        resolveInbloxIdFromCoinAddress[_newAddress][_index] = inbloxId;
        return true;

    }

    /**
    * @dev Resolve the address of a coin from user's inbloxId and index
    * @param _inbloxId user inbloxId string
    * @param _index index of the blockchain address mapping
    * @return user's coin address
    */
    function resolveCoinAddress (string calldata _inbloxId, uint256 _index) external view returns (string memory) {

        string memory inbloxId = toLower(_inbloxId);
        require(indexTaken[_index] == true);
        return inbloxIdToCoinAddress[inbloxId][_index];
    }

    /**
    * @dev resolve the user's inbloxId from their coin address and index number
    * @param _address user's coin address
    * @param _index index of the blockchain
    * @return inbloxId of the user
    */
    function resolveCoinInbloxId (string calldata _address, uint256 _index) external view returns (string memory) {

        string memory otherAddress = toLower(_address);
        require(indexTaken[_index] == true);
        return resolveInbloxIdFromCoinAddress[otherAddress][_index];
    }

}