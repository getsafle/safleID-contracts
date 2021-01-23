pragma solidity 0.5.0;


interface RegistrarStorage {


    function registerRegistrar(address,string calldata) external returns (bool);
    function updateRegistrar(address,string calldata) external returns (bool);
    function registerInbloxId(address, address,string calldata) external returns(bool);
    function updateInbloxId(address , address , string calldata )  external  returns(bool);
    function mapCoin(uint256, string calldata, string calldata, address) external returns(bool);
    function registerCoinAddress(address, uint256, string calldata, address) external returns (bool);
    function updateCoinAddress(address,uint256, string calldata, address) external returns (bool);
}
