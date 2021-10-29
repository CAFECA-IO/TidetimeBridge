// SPDX-License-Identifier: MIT

pragma solidity ^0.6.12;

contract AddressMapping {
    mapping (string => bytes32) mappingTable;
    
    event SetMapping(bytes4 chainID, bytes32 address1, bytes32 address2);

    function getAddress(
        bytes4 chainID_,
        bytes32 fromAddress_
    )
        public
        view
    returns(bytes32 _findAddress) {
        bytes32 findAddress = mappingTable[append(chainID_, fromAddress_)];
        return (findAddress);
    }
    
    function setAddress(
        bytes4 chainID_,
        bytes32 address1_,
        bytes32 address2_
    )
        public
    returns(bool success) {
        require(mappingTable[append(chainID_, address1_)] == bytes32(0), "chainID_, address1_ exist");
        require(mappingTable[append(chainID_, address2_)] == bytes32(0), "chainID_, address2_ exist");
        mappingTable[append(chainID_, address1_)] = address2_;
        mappingTable[append(chainID_, address2_)] = address1_;
        emit SetMapping(chainID_, address1_, address2_);
        return true;
    }
    
    function append(bytes4 a, bytes32 b) internal pure returns (string memory) {
        return string(abi.encodePacked(a, b));
    }
}