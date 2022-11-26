// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// import "hardhat/console.sol";

contract Bingo {
    enum GameState {
        SETUP,
        RUNNING,
        BINGOFOUND
    }

    struct Ticket {
        uint8[25] card;
        bool valid;
        bool paidOut;
    }

    uint public ticketCost;
    address public host;
    GameState public gameState;

    mapping(address => Ticket) public addressToTicket;

    constructor(uint _ticketCost) payable {
        ticketCost = _ticketCost;
        host = msg.sender;
        buyTicket();
    }

    function buyTicket() public payable {
        require(gameState == GameState.SETUP, "The game has already started");
        require(msg.value >= ticketCost, "Insufficient amount sent");
        require(
            addressToTicket[msg.sender].card[0] == 0,
            "You already own a ticket"
        );
        uint8[25] memory bingoCard = generateCard();

        Ticket memory ticket;
        ticket.valid = true;
        ticket.card = bingoCard;
        ticket.paidOut = false;

        addressToTicket[msg.sender] = ticket;
    }

    function getTicket() public view returns (uint8[25] memory) {
        return addressToTicket[msg.sender].card;
    }

    function generateCard() private view returns (uint8[25] memory) {
        uint8[] memory nums = getNumbers();

        // Randomize the array of numbers
        // Note This is pseudo-random
        for (uint i = 0; i < nums.length - 1; i++) {
            uint j = (uint(
                keccak256(
                    abi.encodePacked(
                        i,
                        block.difficulty,
                        block.timestamp,
                        msg.sender
                    )
                )
            ) % nums.length);
            uint8 temp = nums[i];
            nums[i] = nums[j];
            nums[j] = temp;
        }

        // Choose the first 25 values as the bingo card
        uint8[25] memory card;
        for (uint i = 0; i < 25; i++) {
            card[i] = nums[i];
        }
        return card;
    }

    function getNumbers() public pure returns (uint8[] memory) {
        uint8[] memory numbers = new uint8[](75);
        for (uint8 i = 0; i < 75; i++) {
            numbers[i] = i + 1;
        }
        return numbers;
    }
}
