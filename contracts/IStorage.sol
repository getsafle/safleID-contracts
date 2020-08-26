pragma solidity 0.5.0;


interface RegistrarStorage {


    function registerRegistrar(address,string calldata) external returns (bool);
    function updateRegistrar(address,string calldata) external returns (bool);
    function setAddressAndHandleName(address, address,string calldata) external returns(bool);
    function updateHandleName(address , address , string calldata )  external  returns(bool);
    function addCoin(uint256, string calldata, string calldata, address) external returns(bool); 
    function registerCoinAddress(address, uint256, string calldata, address) external returns (bool);
    function updateCoinAddress(address,uint256, string calldata, address) external returns (bool);
}
