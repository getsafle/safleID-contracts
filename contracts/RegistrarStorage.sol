pragma solidity 0.5.0;

import "./checkingContract.sol";

contract RegistrarStorage is checkingContract {

    // Struct to store the Registrar data
    struct registrar {
        bool isRegisteredRegistrar;
        string registrarName;
        address registarAddress;
    }

    // Struct to store the Other coin mapping data
    struct otherCoin {
        string coinName;
        string aliasName;
        bool isIndexMapped;
    }

    // State variables to keep track of counts
    uint8 constant MAX_NAME_UPDATES = 2;
    uint256 public totalRegistrars;
    uint256 public totalSafleIdRegistered;

    // Mappings to track total updates
    mapping( address => uint8 ) public totalRegistrarUpdates;
    mapping( address => uint8 ) public totalSafleIDCount;

    // State variables to manage contract addresses
    address public contractOwner;
    address public mainContract;
    address public auctionContractAddress;

    // Mappings to manage the Registrar functionalities
    mapping( address => bytes[] ) public resolveOldRegistrarAddress;
    mapping( bytes => address )  registrarNameToAddress;
    mapping( address => registrar ) public Registrars;

    // Mappings to manage the SafleID functionalities
    mapping( bytes => address ) resolveAddressFromSafleId;
    mapping( address => bool ) public isAddressTaken;
    mapping( address => string ) public resolveUserAddress;
    mapping( string => bool ) unavailableSafleIds;
    mapping( address => bytes[] ) public resolveOldSafleIdFromAddress;
    mapping( bytes => address )  resolveOldSafleID;

    // Mappings to keep track of other coin address mapping and registration
    mapping( uint256 => otherCoin ) public OtherCoin;
    mapping( string => bool ) isCoinMapped;
    mapping( string => string ) coinAddressToSafleId;
    mapping( string => mapping (uint256 => string) ) safleIdToCoinAddress;

    mapping( address => bool ) public auctionProcess;

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

    //Modifier to ensure that necessary conditions are satified before registering or updating Registrar
    modifier registrarChecks (string memory _registrarName) {

        bytes memory regNameBytes = bytes(_registrarName);

        require(registrarNameToAddress[regNameBytes] == address(0x0), "Registrar name is already taken.");
        require(resolveAddressFromSafleId[regNameBytes] == address(0x0), "This Registrar name is already registered as an SafleID.");
        _;

    }

    //Modifier to ensure that necessary conditions are satified before registering or updating SafleID
    modifier safleIdChecks (string memory _safleId, address _registrar) {

        bytes memory idBytes = bytes(_safleId);

        require(Registrars[_registrar].registarAddress != address(0x0), "Invalid Registrar.");
        require(registrarNameToAddress[idBytes] == address(0x0), "This SafleId is taken by a Registrar.");
        require(resolveAddressFromSafleId[idBytes] == address(0x0), "This SafleId is already registered.");
        require(unavailableSafleIds[_safleId] == false, "SafleId is already used once, not available now");
        _;

    }

    // Modifier to ensure that the caller is the Auction Contract
    modifier auctionContract () {

        require(msg.sender == auctionContractAddress);
        _;

    }

    // Modifier to ensure that necessary conditions are satisfied before registering or updating coin address
    modifier coinAddressCheck(address _userAddress,uint256 _index, address _registrar) {

        require(Registrars[_registrar].registarAddress != address(0x0), "Invalid Registrar");
        require (auctionProcess[_userAddress] == false);
        require(OtherCoin[_index].isIndexMapped == true, "This index number is not mapped.");
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
    function registerRegistrar(address _registrar, string calldata _registrarName)
    external
    registrarChecks(_registrarName)
    onlyMainContract
    returns(bool)  {

        bytes memory regNameBytes = bytes(_registrarName);

        require(isAddressTaken[_registrar] == false, "This address is already registered.");

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
    * @param _newRegistrarName new name of the Registrar to update
    * @return true
    */
    function updateRegistrar(address _registrar, string calldata _newRegistrarName)
    external
    registrarChecks(_newRegistrarName)
    onlyMainContract
    returns (bool) {

        bytes memory newNameBytes = bytes(_newRegistrarName);

        require(isAddressTaken[_registrar] == true, "Registrar should register first.");
        require(totalRegistrarUpdates[_registrar]+1 <= MAX_NAME_UPDATES, "Maximum update count reached.");

        registrar memory registrarObject = Registrars[_registrar];
        string memory oldName = registrarObject.registrarName;
        bytes memory oldNameBytes = bytes(oldName);
        registrarNameToAddress[oldNameBytes] = address(0x0);

        resolveOldRegistrarAddress[_registrar].push(bytes(Registrars[_registrar].registrarName));
        
        Registrars[_registrar].registrarName = _newRegistrarName;
        Registrars[_registrar].registarAddress = _registrar;

        registrarNameToAddress[newNameBytes] = _registrar;
        totalRegistrarUpdates[_registrar]++;
        return true;

    }

    /**
    * @dev Resolve the registrar address from registrar name
    * @param _name safleId of the registrar
    * @return registrar address
    */
    function resolveRegistrarName(string calldata _name) external view returns(address) {
        bytes memory regNameBytes = bytes(_name);

        require(registrarNameToAddress[regNameBytes] != address(0x0), "Resolver : Registrar is not yet registered for this SafleID.");

        return registrarNameToAddress[regNameBytes];
    }

    /**
    * @dev Register a user's address and safleId
    * Only the Main contract can call this function
    * @param _registrar address of the Registrar
    * @param _userAddress address of the new user
    * @param _safleId safleId of the new user
    * @return true
    */
    function registerSafleId(address _registrar, address _userAddress, string calldata _safleId)
    external
    safleIdChecks(_safleId, _registrar)
    onlyMainContract
    returns(bool)
    {

        require(isAddressTaken[_userAddress] == false, "SafleID already registered");
        
        bytes memory idBytes = bytes(_safleId);

        resolveAddressFromSafleId[idBytes] = _userAddress;
        isAddressTaken[_userAddress] = true;
        resolveUserAddress[_userAddress] = _safleId;
        totalSafleIdRegistered++;

        return true;

    }

    /**
    * @dev Update the safleId of an already registered user
    * Only the Main contract can call this function
    * @param _registrar address of a Registrar
    * @param _userAddress address of the user
    * @param _safleId new safleId of that user
    * @return true
    */
    function updateSafleId(address _registrar, address _userAddress, string calldata _safleId)
    external
    safleIdChecks(_safleId, _registrar)
    onlyMainContract
    returns(bool)
    {

        require(totalSafleIDCount[_userAddress]+1 <= MAX_NAME_UPDATES, "Maximum update count reached.");

        require(isAddressTaken[_userAddress] == true, "SafleID not registered.");
        require(auctionProcess[_userAddress] == false, "SafleId cannot be updated inbetween Auction.");

        bytes memory idBytes = bytes(_safleId);

        string memory oldName = resolveUserAddress[_userAddress];
        bytes memory oldIdBytes = bytes(oldName);

        unavailableSafleIds[oldName] = true;
        resolveAddressFromSafleId[oldIdBytes] = address(0x0);
        oldSafleIds(_userAddress,oldIdBytes);

        resolveAddressFromSafleId[idBytes] = _userAddress;
        resolveUserAddress[_userAddress] = _safleId;

        totalSafleIDCount[_userAddress]++;
        totalSafleIdRegistered++;

        return true;
    }

    /**
    * @dev resolve the address of the user using safleId
    * @param _safleId safleId of the user
    * @return address associated to that particular address
    */
    function resolveSafleId(string calldata _safleId)
    external
    view
    returns(address)
    {
        bytes memory idBytes = bytes(_safleId);
        require(bytes(_safleId).length != 0, "Resolver : user SafleID should not be empty.");
        require(resolveAddressFromSafleId[idBytes] != address(0x0), "Resolver : User is not yet registered for this SafleID.");
        return resolveAddressFromSafleId[idBytes];
    }

   /**
    * @dev Transfer the safleId of a user to a new user
    * Can only be called by the Auction contract
    * @param _safleId the safleId of the user to be trasferred
    * @param _oldOwner address of the old user
    * @param _newOwner address of the new user
    * @return true
    */
    function transferSafleId (string calldata _safleId, address _oldOwner, address _newOwner) external auctionContract returns (bool) {

        bytes memory idBytes = bytes(_safleId);

        require(isAddressTaken[_oldOwner] == true, "You are not an owner of this safleId.");
        require(resolveAddressFromSafleId[idBytes] != address(0x0), "This SafleId does not have an owner.");

        oldSafleIds(_oldOwner,idBytes);
        isAddressTaken[_oldOwner] = false;

        resolveAddressFromSafleId[idBytes] = _newOwner;

        auctionProcess[_oldOwner] = false;
        isAddressTaken[_newOwner] = true;
        resolveUserAddress[_newOwner] = _safleId;
        return true;

    }

    /**
    * @dev Update the safleId inside the array
    * This function can only be called internally
    * @param _userAddress the address of the user
    * @param _safleId the safleId to be updated in bytes
    */
    function oldSafleIds(address _userAddress, bytes memory _safleId )
    internal
    {
        resolveOldSafleIdFromAddress[_userAddress].push(_safleId);
        resolveOldSafleID[_safleId] = _userAddress;
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
    * @dev Update the data for the active auction
    * @param _safleIdOwner address of a safleId owner
    * @param _safleId safleId in string
    * @return true
    */
    function auctionInProcess (address _safleIdOwner, string calldata _safleId) external auctionContract returns (bool) {

        bytes memory idBytes = bytes(_safleId);

        require(bytes(_safleId).length != 0, "Resolver : User SafleID should not be empty.");
        require(resolveAddressFromSafleId[idBytes] != address(0x0), "Resolver : User is not yet registered for this SafleID.");
        auctionProcess[_safleIdOwner] = true;
        return true;

    }

    /**
    * @dev Add a new coin address mapping
    * Can only be called by the Main Contract
    * @param _indexnumber index of the new coin
    * @param _coinName coin name of the coin
    * @param _aliasName alias name of the coin
    * @return true
    */
    function mapCoin(uint256 _indexnumber, string calldata _coinName, string calldata _aliasName, address _registrar)
    external
    onlyMainContract
    returns(bool) {
        require(OtherCoin[_indexnumber].isIndexMapped == false, "This index number has already been mapped.");
        require (isCoinMapped[_coinName] == false, "This coin is already mapped.");
        require(Registrars[_registrar].registarAddress != address(0x0), "Invalid Registrar.");

        OtherCoin[_indexnumber].isIndexMapped = true;
        OtherCoin[_indexnumber].aliasName = _aliasName;
        OtherCoin[_indexnumber].coinName = _coinName;
        isCoinMapped[_coinName] = true;
        return true;

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
    function registerCoinAddress(address _userAddress,uint256 _index, string calldata _address, address _registrar) external coinAddressCheck(_userAddress, _index, _registrar) onlyMainContract returns (bool){

        require(Registrars[_registrar].registarAddress != address(0x0), "Invalid Registrar.");
        require (auctionProcess[_userAddress] == false);
        require(OtherCoin[_index].isIndexMapped == true, "This index number is not mapped.");

        string memory safleId = resolveUserAddress[_userAddress];
        safleIdToCoinAddress[safleId][_index] = _address;
        coinAddressToSafleId[_address] = safleId;
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
    function updateCoinAddress(address _userAddress,uint256 _index, string calldata _newAddress, address _registrar) external coinAddressCheck(_userAddress, _index, _registrar) onlyMainContract returns (bool){

        require(Registrars[_registrar].registarAddress != address(0x0), "Invalid Registrar");
        require (auctionProcess[_userAddress] == false);
        require(OtherCoin[_index].isIndexMapped == true, "This index number is not mapped.");

        string memory safleId = resolveUserAddress[_userAddress];
        string memory previousAddress = safleIdToCoinAddress[safleId][_index];
        require(checkLength(previousAddress) > 0);

        safleIdToCoinAddress[safleId][_index] = _newAddress;
        coinAddressToSafleId[_newAddress] = safleId;
        return true;
    }

    /**
    * @dev Get the safleID of the user from the coin address
    * @param _address address of the user
    * @return safleId of that particular coin address
    */
    function coinAddressToId(string calldata _address) external view returns (string memory){
        return coinAddressToSafleId[_address];
    }

    /**
    * @dev Get the coin address of the user from the safleId and index number
    * @param _safleId address of the user
    * @param _index address of the user
    * @return coin address corresponding to that safleId and index
    */
    function idToCoinAddress(string calldata _safleId, uint256 _index) external view returns (string memory){
        return safleIdToCoinAddress[_safleId][_index];
    }

}