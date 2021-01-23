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
    uint256 public totalInbloxIdRegistered;

    // Mappings to track total updates
    mapping( address => uint8 ) public totalRegistrarUpdates;
    mapping( address => uint8 ) public totalInbloxIDCount;

    // State variables to manage contract addresses
    address public contractOwner;
    address public mainContract;
    address public auctionContractAddress;

    // Mappings to manage the Registrar functionalities
    mapping( address => bytes[] ) public resolveOldRegistrarAddress;
    mapping( bytes => address )  registrarNameToAddress;
    mapping( address => registrar ) public Registrars;

    // Mappings to manage the InbloxID functionalities
    mapping( bytes => address ) resolveAddressFromInbloxId;
    mapping( address => bool ) public isAddressTaken;
    mapping( address => string ) public resolveUserAddress;
    mapping( string => bool ) unavailableInbloxIds;
    mapping( address => bytes[] ) public resolveOldInbloxIdFromAddress;
    mapping( bytes => address )  resolveOldInbloxID;

    // Mappings to keep track of other coin address mapping and registration
    mapping( uint256 => otherCoin ) public OtherCoin;
    mapping( string => bool ) isCoinMapped;
    mapping( string => string ) coinAddressToInbloxId;
    mapping( string => mapping (uint256 => string) ) inbloxIdToCoinAddress;

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
        require(resolveAddressFromInbloxId[regNameBytes] == address(0x0), "This Registrar name is already registered as an InbloxID.");
        _;

    }

    //Modifier to ensure that necessary conditions are satified before registering or updating InbloxID
    modifier inbloxIdChecks (string memory _inbloxId, address _registrar) {

        bytes memory idBytes = bytes(_inbloxId);

        require(Registrars[_registrar].registarAddress != address(0x0), "Invalid Registrar.");
        require(registrarNameToAddress[idBytes] == address(0x0), "This InbloxId is taken by a Registrar.");
        require(resolveAddressFromInbloxId[idBytes] == address(0x0), "This InbloxId is already registered.");
        require(unavailableInbloxIds[_inbloxId] == false, "InbloxId is already used once, not available now");
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
    * @param _name inbloxId of the registrar
    * @return registrar address
    */
    function resolveRegistrarName(string calldata _name) external view returns(address) {
        bytes memory regNameBytes = bytes(_name);

        require(registrarNameToAddress[regNameBytes] != address(0x0), "Resolver : Registrar is not yet registered for this InbloxID.");

        return registrarNameToAddress[regNameBytes];
    }

    /**
    * @dev Register a user's address and inbloxId
    * Only the Main contract can call this function
    * @param _registrar address of the Registrar
    * @param _userAddress address of the new user
    * @param _inbloxId inbloxId of the new user
    * @return true
    */
    function registerInbloxId(address _registrar, address _userAddress, string calldata _inbloxId)
    external
    inbloxIdChecks(_inbloxId, _registrar)
    onlyMainContract
    returns(bool)
    {

        require(isAddressTaken[_userAddress] == false, "InbloxID already registered");
        
        bytes memory idBytes = bytes(_inbloxId);

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
    function updateInbloxId(address _registrar, address _userAddress, string calldata _inbloxId)
    external
    inbloxIdChecks(_inbloxId, _registrar)
    onlyMainContract
    returns(bool)
    {

        require(totalInbloxIDCount[_userAddress]+1 <= MAX_NAME_UPDATES, "Maximum update count reached.");

        require(isAddressTaken[_userAddress] == true, "InbloxID not registered.");
        require(auctionProcess[_userAddress] == false, "InbloxId cannot be updated inbetween Auction.");

        bytes memory idBytes = bytes(_inbloxId);

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
    * @dev Transfer the inbloxId of a user to a new user
    * Can only be called by the Auction contract
    * @param _inbloxId the inbloxId of the user to be trasferred
    * @param _oldOwner address of the old user
    * @param _newOwner address of the new user
    * @return true
    */
    function transferInbloxId (string calldata _inbloxId, address _oldOwner, address _newOwner) external auctionContract returns (bool) {

        bytes memory idBytes = bytes(_inbloxId);

        require(isAddressTaken[_oldOwner] == true, "You are not an owner of this inbloxId.");
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

        string memory inbloxId = resolveUserAddress[_userAddress];
        inbloxIdToCoinAddress[inbloxId][_index] = _address;
        coinAddressToInbloxId[_address] = inbloxId;
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

        string memory inbloxId = resolveUserAddress[_userAddress];
        string memory previousAddress = inbloxIdToCoinAddress[inbloxId][_index];
        require(checkLength(previousAddress) > 0);

        inbloxIdToCoinAddress[inbloxId][_index] = _newAddress;
        coinAddressToInbloxId[_newAddress] = inbloxId;
        return true;
    }

    /**
    * @dev Get the inbloxID of the user from the coin address
    * @param _address address of the user
    * @return inbloxId of that particular coin address
    */
    function coinAddressToId(string calldata _address) external view returns (string memory){
        return coinAddressToInbloxId[_address];
    }

    /**
    * @dev Get the coin address of the user from the inbloxId and index number
    * @param _inbloxId address of the user
    * @param _index address of the user
    * @return coin address corresponding to that inbloxId and index
    */
    function idToCoinAddress(string calldata _inbloxId, uint256 _index) external view returns (string memory){
        return inbloxIdToCoinAddress[_inbloxId][_index];
    }

}