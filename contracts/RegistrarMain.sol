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

    modifier onlyContractOwner () {
        
        require(msg.sender == contractOwner,"msg sender is not a contract owner");
        _;

    }
    
    modifier checkStorageContractAddress () {
        
        require(storageContractAddress,"storage address not set");
        _;

    }

    modifier checkRegistartionProcess () {
        
        require(isHandlenameRegistrationPaused == false,"Handle name Registration is Paused");
        _;

    }


    /**
    * @dev  constructor of the contract 
    * @param _walletAddress wallet address to transfer fees
    */

    constructor (address payable _walletAddress) public {

        require(_walletAddress != address(0));
        contractOwner = msg.sender ;
        walletAddress = _walletAddress;

    }

    /**
    * @dev  to set handle name fees by owner 
    * @param _amount fees in wei
    */
    function setHandleNameFees(uint256 _amount) onlyContractOwner
    public
    
    {
        require(_amount > 0);
        userHandleNameRegFees = _amount ;

    }

    /**
    * @dev  to set Ragistrar registration fees by owner 
    * @param _amount fees in wei
    */
    function setRegistrarFees(uint256 _amount) onlyContractOwner
    public
    
    {
        require(_amount > 0);
        registrarFees = _amount;

    }
    
    /**
    * @dev  to pause and unpause the registration of handle name 
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
    * @dev  to add registrar in storage contract
    * @param _registrarName string to be taken as a name of Ragistrar
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
    * @dev  to add handle name in storage contract
    * @param _userAddress address of a user
    * @param _handleName string of a user handle name
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
    * @dev  to update registrar in storage contract
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
    * @dev  to update handle name of a user in storage contract
    * @param _userAddress address of a user 
    * @param _newHandleName string of a user new handle name
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
    * @dev  to set registrar storage address
    * @param _registrarStorageContract address 
    */
    function setRegistrarStorageContract(RegistrarStorage _registrarStorageContract) onlyContractOwner
    public
    
    {

        registrarStorageContractAddress = _registrarStorageContract;
        storageContractAddress = true;

    }

    /**
    * @dev  to update Wallet Address to collect fees
    * @param _walletAddress to redirect fees 
    */
    function updateWalletAddress(address payable _walletAddress) onlyContractOwner
    public
    
    {
        require(!isContract(_walletAddress));
        walletAddress = _walletAddress;

    }

    /**
    * @dev  to add new coin by Registrar only 
    * @param _indexnumber index of a new coin
    * @param _blockchainName string of a blockchain name of a coin
    * @param _aliasName string of a alias name of a blockchain or coin
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
    * @dev  to register coin address with handle name
    * @param _userAddress address of a user
    * @param _index index of a blockchain 
    * @param _address string of a address of coin
    */

    function registerCoinAddress(address _userAddress,uint256 _index, string calldata _address) external returns (bool){
        
        string memory lowerAddress = toLower(_address);
        uint8 length = checkLength(_address);
        require(_index != 0 && _userAddress != address(0));
        require(length > 0);
        require(registrarStorageContractAddress.registerCoinAddress(_userAddress,_index,lowerAddress, msg.sender),"Storage contract fail");

    }


    /**
    * @dev  to updtae coin address with handle name
    * @param _userAddress address of a user
    * @param _index index of a blockchain 
    * @param _address string of a address of coin
    */

    function updateCoinAddress(address _userAddress,uint256 _index, string calldata _address) external returns (bool){
        
        string memory lowerAddress = toLower(_address);
        uint8 length = checkLength(_address);
        require(_index != 0 && _userAddress != address(0));
        require(length > 0);
        require(registrarStorageContractAddress.registerCoinAddress(_userAddress,_index,lowerAddress, msg.sender),"Storage contract fail");

    }

}

