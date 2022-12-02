// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./Bingo.sol";

contract BingoFactory {
    address public owner;
    Bingo[] contracts;

    constructor(address _owner) {
        owner = _owner;
    }

    function createRoom(uint _ticketCost, uint8 _maxPlayers) public payable {
        Bingo bingo = new Bingo(_ticketCost, _maxPlayers);
        contracts.push(bingo);
    }

    function getContracts() public view returns (Bingo[] memory) {
        return contracts;
    }

    receive() external payable {}

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "Only contract owner can call this function"
        );
        _;
    }

    function withdraw() external onlyOwner {
        (bool success, ) = payable(owner).call{value: address(this).balance}(
            ""
        );
        require(success, "Failed to withdraw");
    }

    function changeOwner(address _owner) public onlyOwner {
        owner = _owner;
    }
}
