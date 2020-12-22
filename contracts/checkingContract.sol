pragma solidity 0.5.0;


contract checkingContract {

    uint8 constant MAX_INBLOXID_LENGTH = 16;
    uint8 constant MIN_INBLOXID_LENGTH = 4;

    /**
    * @dev  check if address is of wallet or contract 
    * @param _resolverAddress address to check
    */
    function isContract(address _resolverAddress) 
    internal view
    returns(bool)
    {
        uint32 size;
        assembly {
            size := extcodesize(_resolverAddress)
        }
        return (size > 0);
    }
    
    /**
    * @dev  convert a string to lower case 
    * @param str string to be converted
    */

    function toLower(string memory str) public pure returns (string memory) {
        bytes memory bStr = bytes(str);
        bytes memory bLower = new bytes(bStr.length);
        for (uint i = 0; i < bStr.length; i++) {
            // Uppercase character...
            if ((uint8(bStr[i]) >= 65) && (uint8(bStr[i]) <= 90)) {
                // So we add 32 to make it lowercase
                bLower[i] = bytes1(uint8(bStr[i]) + 32);
            } else {
                bLower[i] = bStr[i];
            }
        }
        return string(bLower);
    }
    

    /**
    * @dev  to check length of a string 
    * @param _name string length to be check
    */
    function checkLength(string memory _name) public pure returns (uint8){
        require(bytes(_name).length != 0, "Library : String passed is of zero length");
        return uint8(bytes(_name).length);
    }

    /**
    * @dev  to check if sring contain alphanumeric or not 
    * @param inbloxId string length to be check
    */

    function checkAlphaNumeric(string memory inbloxId) public pure returns (bool){
    
    string memory VNinLowerCase = toLower(inbloxId);
    bytes memory b = bytes(VNinLowerCase);

    for(uint i; i<b.length; i++){
        bytes1 char = b[i];

        if(
            !(char >= 0x30 && char <= 0x39) && 
            !(char >= 0x61 && char <= 0x7A) 

        )
            return false;
    }

    return true;
    }    
    
    function isInbloxIdValid (string memory _registrarName) internal pure returns (bool){
        
        string memory VNinLowerCase = toLower(_registrarName);
        uint8 length = checkLength(_registrarName);
        require(checkAlphaNumeric(VNinLowerCase),"only alphanumeric allowed");
        require(length <= MAX_INBLOXID_LENGTH && length >= MIN_INBLOXID_LENGTH,"InbloxId length should be between 4-16 characters");
        return true;

    }

}
