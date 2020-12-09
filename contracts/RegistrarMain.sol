pragma solidity 0.5.0;

import "./IStorage.sol";
import "./checkingContract.sol";

contract RegistrarMain is checkingContract{

    uint256 public registrarFees;
    uint256 public userHandleNameRegFees;
    address public contractOwner;
    address payable  public  walletAddress;
    bool public storageContractAddress;
    bool public isHandlenameRegistrationPaused;

    RegistrarStorage public registrarStorageContractAddress;

    // @dev Modifier to ensure the function caller is the contract owner.
    modifier onlyContractOwner () {

        require(msg.sender == contractOwner, "msg sender is not a contract owner");
        _;

    }

    // @dev Modifier to ensure the Storage contract address is set.
    modifier checkStorageContractAddress () {

        require(storageContractAddress, "storage address not set");
        _;

    }

    // @dev Modifier to ensure the handlename registration is not paused.
    modifier checkRegistartionProcess () {

        require(isHandlenameRegistrationPaused == false, "Handle name Registration is Paused");
        _;

    }


    /**
    * @dev constructor of the contract
    * @param _walletAddress wallet address to transfer fees
    */
    constructor (address payable _walletAddress) public {

        require(_walletAddress != address(0));
        contractOwner = msg.sender;
        walletAddress = _walletAddress;

    }

    /**
    * @dev Set handlename fees
    * Only the contract owner can call this function
    * @param _amount fees in wei
    */
    function setHandleNameFees(uint256 _amount) onlyContractOwner
    public

    {
        require(_amount > 0);
        userHandleNameRegFees = _amount;

    }

    /**
    * @dev Set Registrar registration fees by owner
    * Only the contract owner can call this function
    * @param _amount fees in wei
    */
    function setRegistrarFees(uint256 _amount) onlyContractOwner
    public

    {
        require(_amount > 0);
        registrarFees = _amount;

    }

    /**
    * @dev Pause and resume the handlename registration
    * Only the contract owner can call this function
    * @return True if paused, else false.
    */
    function stopOrRestartRegistration () external onlyContractOwner returns (bool){

    if(isHandlenameRegistrationPaused == false){
        isHandlenameRegistrationPaused = true;
    }else{
        isHandlenameRegistrationPaused = false;
    }
     return true;

    }


    /**
    * @dev Register a new Registrar
    * Can be called only if handlename registration is not paused and storage contract is set
    * This method is payable.
    * @param _registrarName Registrar name in string
    */
    function addRegistrar(string memory _registrarName)  checkRegistartionProcess checkStorageContractAddress payable
    public

    {

        require(msg.value >= registrarFees," registration fees not matched");
        require(isHandleNameValid(_registrarName));
        string memory VNinLowerCase = toLower(_registrarName);
        walletAddress.transfer(msg.value);
        require(registrarStorageContractAddress.registerRegistrar(msg.sender,VNinLowerCase),"storage address error");

    }

    /**
    * @dev Register a user's handlename
    * Can be called only if handlename registration is not paused and storage contract is set
    * This method is payable.
    * @param _userAddress address of the user
    * @param _handleName handlename of the user
    */
    function addHandleName(address _userAddress, string memory _handleName) checkRegistartionProcess checkStorageContractAddress payable
    public

    {

        require(msg.value >= userHandleNameRegFees,"Fees doesn't Match");
        require(isHandleNameValid(_handleName));
        string memory VNinLowerCase = toLower(_handleName);
        walletAddress.transfer(msg.value);
        require(registrarStorageContractAddress.setAddressAndHandleName(msg.sender,_userAddress,VNinLowerCase),"storage error");        

    }

    /**
    * @dev Update an already registered Registrar
    * This method is payable.
    * Can be called only if handlename registration is not paused and storage contract is set
    * @param _registrarName string to be taken as a New name of Ragistrar
    */
    function updateRegistrar(string memory _registrarName) checkRegistartionProcess checkStorageContractAddress payable
    public

    {

        require(msg.value >= registrarFees,"registration fees not matched");
        require(isHandleNameValid(_registrarName));
        string memory VNinLowerCase = toLower(_registrarName);
        walletAddress.transfer(msg.value);
        require(registrarStorageContractAddress.updateRegistrar(msg.sender,VNinLowerCase),"Storage contract fails");

    }

    /**
    * @dev Update the handlename of a user
    * Can be called only if handlename registration is not paused and storage contract is set
    * This method is payable.
    * @param _userAddress address of a user
    * @param _newHandleName new handlename of the user to update
    */
    function updateHandleNameOfUser(address _userAddress, string memory _newHandleName) checkRegistartionProcess checkStorageContractAddress payable
    public

    {

        require(msg.value >= userHandleNameRegFees,"registration fees not matched");
        require(isHandleNameValid(_newHandleName));
        string memory VNinLowerCase = toLower(_newHandleName);
        walletAddress.transfer(msg.value);
        require(registrarStorageContractAddress.updateHandleName(msg.sender,_userAddress,VNinLowerCase),"Storage contract fails");

    }

    /**
    * @dev Set registrar storage contract address
    * Can be called only be the contract owner
    * @param _registrarStorageContract Address of the storage contract
    */
    function setRegistrarStorageContract(RegistrarStorage _registrarStorageContract) onlyContractOwner
    public

    {

        registrarStorageContractAddress = _registrarStorageContract;
        storageContractAddress = true;

    }

    /**
    * @dev Update wallet address to collect fees
    * Can be called only by the contract owner
    * This method is payable.
    * @param _walletAddress to redirect fees
    */
    function updateWalletAddress(address payable _walletAddress) onlyContractOwner
    public

    {
        require(!isContract(_walletAddress));
        walletAddress = _walletAddress;

    }

    /**
    * @dev Create an other coin address mapping
    * @param _indexnumber index of a new coin
    * @param _blockchainName Name of the coin
    * @param _aliasName Alias name in string
    * @return true if successful, else false
    */
   function addCoins(uint256 _indexnumber, string calldata _blockchainName, string calldata _aliasName) external returns (bool){

        string memory lowerBlockchainName = toLower(_blockchainName);
        string memory lowerAliasName = toLower(_aliasName);
        require(_indexnumber != 0);
        require(checkAlphaNumeric(lowerBlockchainName) && checkAlphaNumeric(lowerAliasName),"only alphanumeric allowed in blockchain name and alias name");
        require(registrarStorageContractAddress.addCoin(_indexnumber,lowerBlockchainName,lowerAliasName, msg.sender),"Storage contract fails");
        return true;

   }

    /**
    * @dev  Register a new coin address
    * @param _userAddress public address of a user
    * @param _index index of the blockchain to set the address
    * @param _address Coin address
    * @return true if successful, else false
    */
    function registerCoinAddress(address _userAddress,uint256 _index, string calldata _address) external returns (bool){
        
        string memory lowerAddress = toLower(_address);
        uint8 length = checkLength(_address);
        require(_index != 0 && _userAddress != address(0));
        require(length > 0);
        require(registrarStorageContractAddress.registerCoinAddress(_userAddress,_index,lowerAddress, msg.sender),"Storage contract fail");

    }

    /**
    * @dev Update the coin address of that user
    * @param _userAddress address of the user
    * @param _index index of that blockchain
    * @param _address new address of that coin
    * @return true if successful, else false
    */
    function updateCoinAddress(address _userAddress,uint256 _index, string calldata _address) external returns (bool){

        string memory lowerAddress = toLower(_address);
        uint8 length = checkLength(_address);
        require(_index != 0 && _userAddress != address(0));
        require(length > 0);
        require(registrarStorageContractAddress.registerCoinAddress(_userAddress,_index,lowerAddress, msg.sender),"Storage contract fail");

    }

}

