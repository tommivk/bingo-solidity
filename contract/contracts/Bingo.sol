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
}
