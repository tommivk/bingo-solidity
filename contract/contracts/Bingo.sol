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
    uint8 maxPlayers;
    uint8 playersJoined;
    uint8 totalNumbersDrawn;
    uint8 hostActionDeadline = 3 minutes;
    uint64 hostLastActionTime;
    address public host;
    GameState public gameState;

    mapping(address => Ticket) public addressToTicket;
    mapping(uint8 => bool) public numbersDrawn;

    constructor(uint _ticketCost, uint8 _maxPlayers) payable {
        ticketCost = _ticketCost;
        maxPlayers = _maxPlayers;
        host = msg.sender;
        buyTicket();
    }

    // Check for bingo
    // Index 12 is a wildcard
    function checkBingo(uint8[25] memory card) public view returns (bool) {
        if (checkDiagonals(card)) return true;

        for (uint i = 0; i < 5; i++) {
            // Check rows
            bool bingoFound = true;
            for (uint j = 0; j < 5; j++) {
                uint rowIndex = (i * 5) + j;
                if (rowIndex == 12) continue;
                if (!numbersDrawn[card[rowIndex]]) {
                    bingoFound = false;
                }
            }
            if (bingoFound) return true;

            // Check columns
            bingoFound = true;
            for (uint j = 0; j < 5; j++) {
                uint columnIndex = (5 * j) + i;
                if (columnIndex == 12) continue;
                if (!numbersDrawn[card[columnIndex]]) {
                    bingoFound = false;
                }
            }
            if (bingoFound) return true;
        }
        return false;
    }

    function checkDiagonals(uint8[25] memory card) private view returns (bool) {
        bool leftDiagonal = numbersDrawn[card[0]] &&
            numbersDrawn[card[6]] &&
            numbersDrawn[card[18]] &&
            numbersDrawn[card[24]];

        bool rightDiagonal = numbersDrawn[card[4]] &&
            numbersDrawn[card[8]] &&
            numbersDrawn[card[16]] &&
            numbersDrawn[card[20]];

        return (leftDiagonal || rightDiagonal) ? true : false;
    }

    modifier onlyHost() {
        require(msg.sender == host, "Only game host can call this function");
        _;
    }

    // TODO Implement chainlink VRF
    function drawNumber() public onlyHost {
        require(gameState == GameState.RUNNING, "The game is not running");
        require(totalNumbersDrawn < 75, "All of the numbers have been drawn");
        totalNumbersDrawn++;
        numbersDrawn[totalNumbersDrawn] = true;
        hostLastActionTime = uint64(block.timestamp);
    }

    function hostTimedOut() private view returns (bool) {
        if (
            gameState == GameState.RUNNING &&
            block.timestamp > (hostLastActionTime + hostActionDeadline)
        ) {
            return true;
        }
        return false;
    }

    function claimHost() public {
        bool timedOut = hostTimedOut();
        require(host == address(0) || timedOut);
        if (timedOut) {
            Ticket storage ticket = addressToTicket[host];
            delete ticket.valid;
            delete ticket.card;
        }
        host = msg.sender;
    }

    function leaveGame() public {
        require(gameState == GameState.SETUP, "The game has already started");
        require(addressToTicket[msg.sender].valid, "You are not a player");

        if (msg.sender == host) {
            host = address(0);
        }

        Ticket storage ticket = addressToTicket[msg.sender];
        delete ticket.valid;
        delete ticket.card;

        payable(msg.sender).transfer(ticketCost);
        playersJoined--;
    }

    function startGame() public onlyHost {
        require(gameState == GameState.SETUP, "The game has already started");
        gameState = GameState.RUNNING;
        hostLastActionTime = uint64(block.timestamp);
    }

    function buyTicket() public payable {
        require(gameState == GameState.SETUP, "The game has already started");
        require(playersJoined < maxPlayers, "The game is full");
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

        playersJoined++;
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
