// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// import "hardhat/console.sol";

contract Bingo {
    uint public ticketCost;
    address public host;

    constructor(uint _ticketCost) payable {
        ticketCost = _ticketCost;
        host = msg.sender;
    }

    function getNumbers() public pure returns (uint8[] memory) {
        uint8[] memory numbers = new uint8[](75);
        for (uint i = 0; i < 75; i++) {
            numbers[i] = uint8(i + 1);
        }
        return numbers;
    }
}
