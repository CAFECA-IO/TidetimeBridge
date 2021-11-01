// SPDX-License-Identifier: MIT

pragma solidity ^0.6.12;

contract AddressMapping {
    address owner;
    mapping (string => bytes32) mappingTable;
    
    event SetMapping(bytes4 chainID, bytes32 address1, bytes32 address2);

    constructor()
        payable
        public
    {
        owner = msg.sender;
    }

    modifier onlyOwner
    {
        assert(msg.sender == owner);
        _;
    }

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
    
    function setDepositAddress(
        bytes4 chainID_,
        bytes32 fromAddress_,
        bytes32 toAddress_
    )
        onlyOwner
        public
    returns(bool success) {
        require(mappingTable[append(chainID_, fromAddress_)] == bytes32(0), "chainID_, fromAddress_ exist");
        mappingTable[append(chainID_, fromAddress_)] = toAddress_;
        emit SetMapping(chainID_, fromAddress_, toAddress_);
        return true;
    }
    
    function setWithdrawAddress(
        bytes4 chainID_,
        bytes32 fromAddress_,
        bytes32 toAddress_
    )
        onlyOwner
        public
    returns(bool success) {
        mappingTable[append(chainID_, fromAddress_)] = toAddress_;
        emit SetMapping(chainID_, fromAddress_, toAddress_);
        return true;
    }
    
    function transferOwnership(
        address newOwner_
    )
        onlyOwner
        public
    {
        owner = newOwner_;
    }
    
    function append(bytes4 a, bytes32 b) internal pure returns (string memory) {
        return string(abi.encodePacked(a, b));
    }
}