// SPDX-License-Identifier: MIT

pragma solidity ^0.6.12;

contract AddressMapping {
    address owner;
    mapping (string => string) mappingTable;
    
    event SetMapping(bytes4 chainID, string address1, string address2);

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
        string memory fromAddress_
    )
        public
        view
    returns(string memory findAddress) {
        findAddress = mappingTable[append(chainID_, fromAddress_)];
        return findAddress;
    }
    
    function setDepositAddress(
        bytes4 chainID_,
        string memory fromAddress_,
        string memory toAddress_
    )
        onlyOwner
        public
    returns(bool success) {
        string memory findAddress = mappingTable[append(chainID_, fromAddress_)];
        require(keccak256(bytes(findAddress)) == keccak256(bytes(string(""))), "chainID_, fromAddress_ exist");
        mappingTable[append(chainID_, fromAddress_)] = toAddress_;
        emit SetMapping(chainID_, fromAddress_, toAddress_);
        return true;
    }
    
    function setWithdrawAddress(
        bytes4 chainID_,
        string memory fromAddress_,
        string memory toAddress_
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
    
    function append(bytes4 a, string memory b) internal pure returns (string memory) {
        return string(abi.encodePacked(a, b));
    }
}